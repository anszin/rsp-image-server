import React from 'react';
import { useEditorStore } from '../../store/editorStore';

export function OptionGroupEditor() {
  const { draft, addOptionGroup, updateOptionGroup, removeOptionGroup,
          addOptionValue, updateOptionValue, removeOptionValue } = useEditorStore();
  const groups = draft.optionGroups ?? [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label style={{ fontWeight: 600, fontSize: 14 }}>옵션 그룹</label>
        <button onClick={addOptionGroup} style={addBtnStyle}>+ 그룹 추가</button>
      </div>

      {groups.map((g, gi) => (
        <div key={gi} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input
              style={inputStyle}
              placeholder="옵션 그룹명 (예: 사이즈)"
              value={g.name}
              onChange={e => updateOptionGroup(gi, { name: e.target.value })}
            />
            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={g.required} onChange={e => updateOptionGroup(gi, { required: e.target.checked })} />
              필수
            </label>
            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={g.multiSelect} onChange={e => updateOptionGroup(gi, { multiSelect: e.target.checked })} />
              복수선택
            </label>
            <button onClick={() => removeOptionGroup(gi)} style={deleteBtnStyle}>✕</button>
          </div>

          {g.values.map((v, vi) => (
            <div key={vi} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center', paddingLeft: 12 }}>
              <input
                style={{ ...inputStyle, flex: 2 }}
                placeholder="선택지명 (예: Large)"
                value={v.name}
                onChange={e => updateOptionValue(gi, vi, e.target.value, v.extraPrice)}
              />
              <input
                style={{ ...inputStyle, flex: 1 }}
                type="number"
                placeholder="추가금액"
                value={v.extraPrice}
                onChange={e => updateOptionValue(gi, vi, v.name, Number(e.target.value))}
              />
              <button onClick={() => removeOptionValue(gi, vi)} style={deleteBtnStyle}>✕</button>
            </div>
          ))}

          <button onClick={() => addOptionValue(gi)} style={{ ...addBtnStyle, marginLeft: 12, fontSize: 12 }}>
            + 선택지 추가
          </button>
        </div>
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '6px 10px',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 13,
};
const addBtnStyle: React.CSSProperties = {
  padding: '5px 12px',
  background: '#f0f7ff',
  border: '1px solid #4fc3f7',
  borderRadius: 6,
  color: '#0288d1',
  cursor: 'pointer',
  fontSize: 13,
};
const deleteBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  background: '#fff0f0',
  border: '1px solid #ffcdd2',
  borderRadius: 6,
  color: '#e53935',
  cursor: 'pointer',
  fontSize: 12,
};
