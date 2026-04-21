import React, { useEffect, useState } from 'react';
import { slotApi, layoutApi, SlotDto, LayoutDto } from '../api/storeApi';
import { itemApi } from '../api/itemApi';
import { Item } from '../types/menu';

interface Props {
  menuId: number;
  storeId: number;
  menuName: string;
}

export function SlotEditorPage({ menuId, storeId, menuName }: Props) {
  const [layout, setLayout] = useState<LayoutDto>({ storeId, orientation: 'LANDSCAPE', columns: 4, rows: 3, itemsPerPage: 12 });
  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(0);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ row: number; col: number } | null>(null);
  const [dragItemId, setDragItemId] = useState<number | null>(null);

  useEffect(() => {
    layoutApi.get(storeId).then(setLayout).catch(() => {});
    slotApi.list(menuId).then(setSlots);
    itemApi.listByMenu(menuId).then(setItems).catch(() => {});
  }, [menuId, storeId]);

  const totalPages = Math.max(1, Math.ceil(slots.filter(s => s.itemId).length / layout.itemsPerPage) + 1);

  const getSlot = (row: number, col: number): SlotDto | undefined =>
    slots.find(s => s.page === page && s.row === row && s.col === col);

  const handleSlotClick = (row: number, col: number) => {
    const slot = getSlot(row, col);
    if (slot?.itemId) {
      // 이미 상품 있음 → 우클릭 또는 클릭으로 제거
      return;
    }
    setSelectedSlot({ row, col });
    setShowItemPicker(true);
  };

  const handleSlotRightClick = async (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    const slot = getSlot(row, col);
    if (!slot?.itemId) return;
    await slotApi.clear(menuId, page, row, col);
    setSlots(await slotApi.list(menuId));
  };

  const handleAssignItem = async (itemId: number) => {
    if (!selectedSlot) return;
    await slotApi.assign(menuId, page, selectedSlot.row, selectedSlot.col, itemId);
    setSlots(await slotApi.list(menuId));
    setShowItemPicker(false);
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

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'Pretendard', background: '#f5f7fa' }}>

      {/* 좌측: 상품 목록 (드래그 소스) */}
      <div style={{ width: 220, background: '#fff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e0e0e0', fontWeight: 700, fontSize: 14 }}>상품 목록</div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
          {items.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragItemId(item.id!)}
              onDragEnd={() => setDragItemId(null)}
              style={{
                padding: '8px 10px', marginBottom: 6,
                border: '1px solid #e0e0e0', borderRadius: 8,
                background: dragItemId === item.id ? '#fff3e0' : '#fff',
                cursor: 'grab', fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.name}</div>
              <div style={{ color: '#ff6b35', fontSize: 12 }}>{item.price?.toLocaleString()}원</div>
              <div style={{ fontSize: 11, color: '#aaa' }}>{item.productCode}</div>
            </div>
          ))}
          {items.length === 0 && <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', marginTop: 20 }}>상품 없음</div>}
        </div>
      </div>

      {/* 우측: 슬롯 그리드 */}
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'auto' }}>
        <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 16 }}>{menuName} — 슬롯 편집</div>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 16 }}>
          클릭: 상품 배치 | 우클릭: 제거 | 드래그: 상품 목록에서 끌어다 놓기
        </div>

        {/* 프리뷰 프레임 */}
        <div style={{
          border: '6px solid #333', borderRadius: 12, overflow: 'hidden',
          background: '#f9f9f9',
          width: isLandscape ? 640 : 380,
          transition: 'width 0.3s',
        }}>
          {/* 헤더 */}
          <div style={{ background: '#ff6b35', color: '#fff', padding: '8px 14px', fontWeight: 700, fontSize: 14 }}>
            {menuName}
            <span style={{ float: 'right', fontSize: 11, opacity: 0.8 }}>{layout.columns}×{layout.rows}</span>
          </div>

          {/* 그리드 */}
          <div style={{ padding: 10 }}>
            {Array.from({ length: layout.rows }).map((_, rowIdx) => (
              <div key={rowIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {Array.from({ length: layout.columns }).map((_, colIdx) => {
                  const slot = getSlot(rowIdx, colIdx);
                  const hasItem = !!slot?.itemId;
                  return (
                    <div
                      key={colIdx}
                      onClick={() => handleSlotClick(rowIdx, colIdx)}
                      onContextMenu={e => handleSlotRightClick(e, rowIdx, colIdx)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => handleDrop(e, rowIdx, colIdx)}
                      style={{
                        flex: 1, height: isLandscape ? 110 : 130,
                        border: hasItem ? '2px solid #ff6b35' : '2px dashed #ddd',
                        borderRadius: 8,
                        background: hasItem ? '#fff' : '#fafafa',
                        cursor: hasItem ? 'context-menu' : 'pointer',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        transition: 'border-color 0.2s',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {hasItem ? (
                        <>
                          {slot.imageUrl ? (
                            <img src={slot.imageUrl} alt="" style={{ width: '100%', height: 60, objectFit: 'cover' }} />
                          ) : (
                            <div style={{ fontSize: 28, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍽️</div>
                          )}
                          <div style={{ padding: '4px 6px', width: '100%', textAlign: 'center' }}>
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

          {/* 페이지 네비게이션 */}
          <div style={{ background: '#fff', borderTop: '1px solid #eee', padding: '8px 14px', display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={navBtnStyle}>◀</button>
            <span style={{ fontSize: 13, color: '#666' }}>페이지 {page + 1}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} style={navBtnStyle}>▶</button>
          </div>
        </div>
      </div>

      {/* 상품 선택 팝업 */}
      {showItemPicker && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setShowItemPicker(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 360, maxHeight: 480, display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>상품 선택</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.id} onClick={() => handleAssignItem(item.id!)}
                  style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fff3e0')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{item.productCode}</div>
                  </div>
                  <div style={{ color: '#ff6b35', fontWeight: 700 }}>{item.price?.toLocaleString()}원</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowItemPicker(false)} style={{ marginTop: 12, padding: '8px', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', background: '#f5f5f5' }}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = { padding: '4px 12px', border: '1px solid #ddd', borderRadius: 5, cursor: 'pointer', background: '#fff', fontSize: 13 };
