import React, { useEffect, useState } from 'react';
import { slotApi, SlotDto } from '../../api/storeApi';
import { useLayoutStore } from '../../store/layoutStore';
import { Item } from '../../types/menu';

interface Props {
  menuId: number;
  menuName: string;
  items: Item[];  // 부모에서 이미 로드된 상품 목록
}

export function SlotEditorPanel({ menuId, menuName, items }: Props) {
  const { layout } = useLayoutStore();
  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [page, setPage] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ row: number; col: number } | null>(null);
  const [dragItemId, setDragItemId] = useState<number | null>(null);

  useEffect(() => {
    slotApi.list(menuId).then(setSlots).catch(() => {});
    setPage(0);
  }, [menuId]);

  const getSlot = (row: number, col: number) =>
    slots.find(s => s.page === page && s.row === row && s.col === col);

  const handleSlotClick = (row: number, col: number) => {
    if (getSlot(row, col)?.itemId) return; // 이미 있으면 우클릭으로만 제거
    setSelectedSlot({ row, col });
    setShowPicker(true);
  };

  const handleRightClick = async (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    const slot = getSlot(row, col);
    if (!slot?.itemId) return;
    await slotApi.clear(menuId, page, row, col);
    setSlots(await slotApi.list(menuId));
  };

  const handleAssign = async (itemId: number) => {
    if (!selectedSlot) return;
    await slotApi.assign(menuId, page, selectedSlot.row, selectedSlot.col, itemId);
    setSlots(await slotApi.list(menuId));
    setShowPicker(false);
    setSelectedSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    if (dragItemId == null) return;
    await slotApi.assign(menuId, page, row, col, dragItemId);
    setSlots(await slotApi.list(menuId));
    setDragItemId(null);
  };

  const isLandscape = layout.orientation === 'LANDSCAPE';
  const frameW = isLandscape ? 560 : 340;

  // 최대 페이지: 현재 배치된 슬롯의 최대 page + 1 (빈 페이지 항상 1개 여유)
  const maxPage = slots.reduce((m, s) => Math.max(m, s.page), -1);
  const totalPages = maxPage + 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 12, color: '#aaa' }}>
        클릭: 배치 | 우클릭: 제거 | 드래그: 왼쪽 목록에서 끌어다 놓기
      </div>

      {/* 메뉴판 그리드 */}
      <div style={{ border: '6px solid #333', borderRadius: 12, overflow: 'hidden', background: '#f9f9f9', width: frameW, transition: 'width 0.3s' }}>
        <div style={{ background: '#ff6b35', color: '#fff', padding: '8px 14px', fontWeight: 700, fontSize: 14 }}>
          {menuName}
          <span style={{ float: 'right', fontSize: 11, opacity: 0.8 }}>{layout.columns}×{layout.rows}</span>
        </div>

        <div style={{ padding: 10 }}>
          {Array.from({ length: layout.rows }).map((_, rowIdx) => (
            <div key={rowIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {Array.from({ length: layout.columns }).map((_, colIdx) => {
                const slot = getSlot(rowIdx, colIdx);
                const hasItem = !!slot?.itemId;
                const cellH = isLandscape ? 100 : 120;
                return (
                  <div
                    key={colIdx}
                    onClick={() => handleSlotClick(rowIdx, colIdx)}
                    onContextMenu={e => handleRightClick(e, rowIdx, colIdx)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, rowIdx, colIdx)}
                    style={{
                      flex: 1, height: cellH,
                      border: hasItem ? '2px solid #ff6b35' : '2px dashed #ddd',
                      borderRadius: 8,
                      background: hasItem ? '#fff' : '#fafafa',
                      cursor: hasItem ? 'context-menu' : 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', position: 'relative',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {hasItem ? (
                      <>
                        {slot.imageUrl
                          ? <img src={slot.imageUrl} alt="" style={{ width: '100%', height: 55, objectFit: 'cover' }} />
                          : <div style={{ fontSize: 26, height: 55, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍽️</div>
                        }
                        <div style={{ padding: '3px 6px', width: '100%', textAlign: 'center' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.itemName}</div>
                          <div style={{ fontSize: 11, color: '#ff6b35' }}>{slot.itemPrice?.toLocaleString()}원</div>
                        </div>
                        {slot.itemStatus === 'SOLD_OUT' && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>품절</div>
                        )}
                      </>
                    ) : (
                      <span style={{ color: '#ccc', fontSize: 22 }}>+</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* 페이지 네비 */}
        <div style={{ background: '#fff', borderTop: '1px solid #eee', padding: '8px 14px', display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ padding: '3px 10px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: '#fff', fontSize: 13 }}>◀</button>
          <span style={{ fontSize: 13, color: '#666' }}>페이지 {page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            style={{ padding: '3px 10px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: '#fff', fontSize: 13 }}>▶</button>
        </div>
      </div>

      {/* 상품 드래그 목록 */}
      <div style={{ width: frameW, border: '1px solid #e0e0e0', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px', borderBottom: '1px solid #eee', fontSize: 12, fontWeight: 700, color: '#666' }}>
          상품 목록 (드래그하여 슬롯에 배치)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 10, maxHeight: 140, overflowY: 'auto' }}>
          {items.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragItemId(item.id!)}
              onDragEnd={() => setDragItemId(null)}
              onClick={() => { /* 클릭으로도 선택 */ }}
              style={{
                padding: '5px 10px', border: `1px solid ${dragItemId === item.id ? '#ff6b35' : '#e0e0e0'}`,
                borderRadius: 6, background: dragItemId === item.id ? '#fff3e0' : '#fff',
                cursor: 'grab', fontSize: 12, whiteSpace: 'nowrap',
              }}
            >
              {item.name} <span style={{ color: '#ff6b35' }}>{item.price?.toLocaleString()}원</span>
            </div>
          ))}
          {items.length === 0 && <span style={{ color: '#aaa', fontSize: 12 }}>등록된 상품이 없습니다</span>}
        </div>
      </div>

      {/* 상품 선택 팝업 */}
      {showPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setShowPicker(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 340, maxHeight: 460, display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>상품 선택</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.id} onClick={() => handleAssign(item.id!)}
                  style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fff3e0')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{item.productCode}</div>
                  </div>
                  <div style={{ color: '#ff6b35', fontWeight: 700, fontSize: 13 }}>{item.price?.toLocaleString()}원</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPicker(false)}
              style={{ marginTop: 10, padding: '8px', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', background: '#f5f5f5' }}>
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
