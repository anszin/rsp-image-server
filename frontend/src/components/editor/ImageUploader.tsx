import React, { useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { itemApi } from '../../api/itemApi';

export function ImageUploader() {
  const { draft, setImageUrls } = useEditorStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    await uploadFiles(files);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    await uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    if (!draft.id) {
      // 아직 저장 전: 로컬 미리보기만
      const urls = files.map(f => URL.createObjectURL(f));
      setImageUrls([...(draft.imageUrls ?? []), ...urls]);
      return;
    }
    const uploaded: string[] = [];
    for (const file of files) {
      const url = await itemApi.uploadImage(draft.id, file);
      uploaded.push(url);
    }
    setImageUrls([...(draft.imageUrls ?? []), ...uploaded]);
  };

  const removeImage = (index: number) => {
    setImageUrls((draft.imageUrls ?? []).filter((_, i) => i !== index));
  };

  return (
    <div>
      <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>이미지</label>

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #b0bec5',
          borderRadius: 8,
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          color: '#90a4ae',
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        이미지를 드래그하거나 클릭하여 업로드
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handleChange} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(draft.imageUrls ?? []).map((url, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <img
              src={url}
              alt=""
              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
            />
            <button
              onClick={() => removeImage(i)}
              style={{
                position: 'absolute', top: -6, right: -6,
                width: 18, height: 18, borderRadius: '50%',
                background: '#e53935', color: '#fff', border: 'none',
                cursor: 'pointer', fontSize: 10, lineHeight: '18px', textAlign: 'center',
              }}
            >✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
