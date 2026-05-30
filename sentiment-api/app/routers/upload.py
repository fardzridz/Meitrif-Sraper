"""
Upload endpoints — handle CSV/Excel file uploads.
"""

import uuid
from datetime import datetime, timezone

import pandas as pd
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from ..auth import get_current_user
from ..database import get_supabase
from ..models import ApiResponse

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_ROWS = 5000
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    text_column: str = Form(default=""),
    owner_id: str = Depends(get_current_user),
):
    """Upload a CSV or Excel file for analysis."""
    # Validate file extension
    filename = file.filename or "unknown"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Format file tidak didukung. Gunakan: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read file content
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File terlalu besar. Maksimum 10MB.")

    # Parse file
    try:
        if ext == ".csv":
            import io
            df = pd.read_csv(io.BytesIO(content))
        else:
            import io
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal membaca file: {str(e)}")

    if len(df) > MAX_ROWS:
        raise HTTPException(
            status_code=400,
            detail=f"File memiliki {len(df)} baris. Maksimum {MAX_ROWS} baris.",
        )

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="File kosong.")

    columns = list(df.columns)

    # Auto-detect text column if not specified
    detected_text_column = text_column
    if not detected_text_column:
        # Heuristic: find column with longest average string length
        text_candidates = []
        for col in columns:
            if df[col].dtype == object:
                avg_len = df[col].dropna().astype(str).str.len().mean()
                text_candidates.append((col, avg_len))

        if text_candidates:
            text_candidates.sort(key=lambda x: x[1], reverse=True)
            detected_text_column = text_candidates[0][0]
        else:
            raise HTTPException(
                status_code=400,
                detail="Tidak ditemukan kolom teks. Tentukan text_column secara manual.",
            )

    if detected_text_column not in columns:
        raise HTTPException(
            status_code=400,
            detail=f"Kolom '{detected_text_column}' tidak ditemukan dalam file.",
        )

    # Save metadata to database
    dataset_id = str(uuid.uuid4())
    db = get_supabase()

    # Store file in Supabase Storage (simplified — store path reference)
    file_path = f"datasets/{owner_id}/{dataset_id}/{filename}"

    # Upload to Supabase Storage
    try:
        db.storage.from_("uploads").upload(file_path, content)
    except Exception:
        # Storage might not be configured, continue with metadata only
        pass

    dataset_data = {
        "id": dataset_id,
        "owner_id": owner_id,
        "filename": filename,
        "file_path": file_path,
        "file_size": len(content),
        "total_rows": len(df),
        "text_column": detected_text_column,
        "columns": columns,
        "status": "validated",
    }

    db.table("uploaded_datasets").insert(dataset_data).execute()

    return ApiResponse(
        success=True,
        data={
            "dataset_id": dataset_id,
            "filename": filename,
            "total_rows": len(df),
            "columns": columns,
            "detected_text_column": detected_text_column,
            "status": "validated",
        },
    )


@router.get("/datasets")
async def list_datasets(owner_id: str = Depends(get_current_user)):
    """List uploaded datasets."""
    db = get_supabase()
    result = (
        db.table("uploaded_datasets")
        .select("*")
        .eq("owner_id", owner_id)
        .order("created_at", desc=True)
        .execute()
    )
    return ApiResponse(success=True, data=result.data or [])


@router.delete("/datasets/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    owner_id: str = Depends(get_current_user),
):
    """Delete an uploaded dataset."""
    db = get_supabase()

    # Verify ownership
    check = (
        db.table("uploaded_datasets")
        .select("id, file_path")
        .eq("id", dataset_id)
        .eq("owner_id", owner_id)
        .single()
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Delete from storage
    try:
        db.storage.from_("uploads").remove([check.data["file_path"]])
    except Exception:
        pass

    # Delete from database
    db.table("uploaded_datasets").delete().eq("id", dataset_id).execute()

    return ApiResponse(success=True, data={"deleted": True})
