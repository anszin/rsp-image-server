import React from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { layoutApi } from '../../api/storeApi';

interface Props {
  storeId: number;
}

export function LayoutSettingPanel({ storeId }: Props) {
  const { layout, setOrientation, setColumns, setRows, setLayout } = useLayoutStore();

  const handleSave = async () => {
    try {
      const saved = await layoutApi.save(storeId, {
        orientation: layout.orientation,
        columns: layout.columns,
        rows: layout.rows,
      });
      setLayout(saved);
      alert('레이아웃이 저장되었습니다.');
    } catch (e: any) {
      alert('저장 실패: ' + (e.response?.data?.message ?? e.message));
    }
  };

  return (
    <div style={{ border: '1px solid #e8f4fd', borderRadius: 8, padding: 14, background: '#f8fcff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#0288d1' }}>화면 레이아웃</span>
        <button onClick={handleSave} style={{
          padding: '4px 12px', background: '#0288d1', color: '#fff',
          border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12,
        }}>저장</button>
      </div>

      {/* 방향 */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>화면 방향</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['LANDSCAPE', 'PORTRAIT'] as const).map(o => (
            <button
              key={o}
              onClick={() => setOrientation(o)}
              style={{
                flex: 1, padding: '6px', border: `1px solid ${layout.orientation === o ? '#0288d1' : '#ddd'}`,
                borderRadius: 6, background: layout.orientation === o ? '#e3f2fd' : '#fff',
                color: layout.orientation === o ? '#0288d1' : '#666',
                cursor: 'pointer', fontSize: 12, fontWeight: layout.orientation === o ? 700 : 400,
              }}
            >
              {o === 'LANDSCAPE' ? '⬛ 가로형' : '▮ 세로형'}
            </button>
          ))}
        </div>
      </div>

      {/* 열 수 */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
          가로 칸 수 (열): <strong>{layout.columns}</strong>
        </div>
        <input
          type="range" min={1} max={8} value={layout.columns}
          onChange={e => setColumns(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#aaa' }}>
          <span>1</span><span>8</span>
        </div>
      </div>

      {/* 행 수 */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
          세로 칸 수 (행): <strong>{layout.rows}</strong>
        </div>
        <input
          type="range" min={1} max={6} value={layout.rows}
          onChange={e => setRows(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#aaa' }}>
          <span>1</span><span>6</span>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#888', textAlign: 'center', background: '#fff', borderRadius: 5, padding: '4px 0' }}>
        1페이지 = {layout.columns} × {layout.rows} = <strong>{layout.columns * layout.rows}개</strong> 상품
      </div>
    </div>
  );
}
