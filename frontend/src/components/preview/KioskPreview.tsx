import React, { useState } from 'react';
import { Item } from '../../types/menu';
import { useLayoutStore } from '../../store/layoutStore';
import { CategoryDto } from '../../api/storeApi';

interface Props {
  item: Partial<Item>;
  allItems?: Item[];
  categories?: CategoryDto[];
}

function KioskItemCard({ item, highlight, size }: { item: Partial<Item>; highlight?: boolean; size: number }) {
  const isSoldOut = item.status === 'SOLD_OUT';
  const imgSize = Math.max(40, size - 50);
  return (
    <div style={{
      border: highlight ? '2px solid #ff6b35' : '1px solid #e0e0e0',
      borderRadius: 8,
      overflow: 'hidden',
      background: isSoldOut ? '#f5f5f5' : '#fff',
      width: size, height: size,
      display: 'flex', flexDirection: 'column',
      opacity: isSoldOut ? 0.6 : 1,
      position: 'relative',
      flexShrink: 0,
      cursor: 'pointer',
    }}>
      <div style={{
        width: '100%', height: imgSize,
        background: item.imageUrls?.[0] ? `url(${item.imageUrls[0]}) center/cover` : '#ffe8d6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(16, imgSize / 2.5),
      }}>
        {!item.imageUrls?.[0] && '🍽️'}
      </div>
      <div style={{ padding: '4px 6px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: Math.max(9, size / 12), fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name || '상품명'}
        </div>
        <div style={{ fontSize: Math.max(9, size / 13), color: '#ff6b35', fontWeight: 700 }}>
          {item.price != null ? item.price.toLocaleString() + '원' : '-'}
        </div>
      </div>
      {isSoldOut && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 14,
        }}>품절</div>
      )}
    </div>
  );
}

export function KioskPreview({ item, allItems = [], categories = [] }: Props) {
  const { layout } = useLayoutStore();
  const [page, setPage] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // 레이아웃 변경 시 첫 페이지로 리셋
  const perPageKey = `${layout.columns}x${layout.rows}`;
  React.useEffect(() => { setPage(0); }, [perPageKey]);

  // 카테고리 목록 변경 시 선택된 카테고리가 없으면 유지, 사라진 경우 전체로 리셋
  React.useEffect(() => {
    if (selectedCategoryId !== null && !categories.find(c => c.id === selectedCategoryId)) {
      setSelectedCategoryId(null);
    }
  }, [categories, selectedCategoryId]);

  const isLandscape = layout.orientation === 'LANDSCAPE';
  const frameW = isLandscape ? 560 : 340;
  const frameH = isLandscape ? 380 : 620;

  // 현재 편집 중 상품을 목록에 병합
  const allDisplayItems: Partial<Item>[] = allItems.length > 0 ? [...allItems] : [];
  if (item.productCode && !allDisplayItems.find(i => i.productCode === item.productCode)) {
    allDisplayItems.push(item);
  }
  if (allDisplayItems.length === 0) allDisplayItems.push(item);

  // 카테고리 탭 필터링
  const displayItems = selectedCategoryId
    ? allDisplayItems.filter(i => i.categoryId === selectedCategoryId)
    : allDisplayItems;

  const perPage = layout.columns * layout.rows;
  const totalPages = Math.max(1, Math.ceil(displayItems.length / perPage));
  const pageItems = displayItems.slice(page * perPage, (page + 1) * perPage);

  // 빈 슬롯 채우기
  while (pageItems.length < perPage) pageItems.push({});

  const gridAreaW = frameW - 16;
  const gridAreaH = frameH - 80; // 헤더 + 탭 + 페이지버튼
  const cellW = Math.floor((gridAreaW - (layout.columns - 1) * 6) / layout.columns);
  const cellH = Math.floor((gridAreaH - (layout.rows - 1) * 6) / layout.rows);
  const cellSize = Math.min(cellW, cellH);

  return (
    <div style={{
      width: frameW, height: frameH,
      border: '8px solid #333', borderRadius: 16,
      overflow: 'hidden', background: '#f9f9f9',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Pretendard',
      transition: 'width 0.3s, height 0.3s',
    }}>
      {/* 헤더 */}
      <div style={{ background: '#ff6b35', color: '#fff', padding: '8px 12px', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
        메뉴 주문
        <span style={{ float: 'right', fontSize: 11, fontWeight: 400, opacity: 0.8 }}>
          {layout.columns}×{layout.rows} | {isLandscape ? '가로형' : '세로형'}
        </span>
      </div>

      {/* 카테고리 탭 */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #eee', padding: '0 8px', flexShrink: 0, overflowX: 'auto' }}>
        {[{ id: null, name: '전체' }, ...categories].map(cat => {
          const active = cat.id === selectedCategoryId;
          return (
            <div key={cat.id ?? 'all'} onClick={() => { setSelectedCategoryId(cat.id); setPage(0); }} style={{
              padding: '7px 12px', fontSize: 12, whiteSpace: 'nowrap',
              fontWeight: active ? 700 : 400,
              borderBottom: active ? '2px solid #ff6b35' : 'none',
              color: active ? '#ff6b35' : '#666', cursor: 'pointer',
            }}>{cat.name}</div>
          );
        })}
      </div>

      {/* 그리드 */}
      <div style={{ flex: 1, overflow: 'hidden', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Array.from({ length: layout.rows }).map((_, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: layout.columns }).map((_, colIdx) => {
              const idx = rowIdx * layout.columns + colIdx;
              const it = pageItems[idx];
              const isHighlight = it?.productCode === item.productCode || (!it?.productCode && idx === 0 && allItems.length === 0);
              return it?.productCode || it?.name ? (
                <KioskItemCard key={colIdx} item={it} highlight={isHighlight} size={cellSize} />
              ) : (
                <div key={colIdx} style={{
                  width: cellSize, height: cellSize, flexShrink: 0,
                  border: '1px dashed #e0e0e0', borderRadius: 8, background: '#fafafa',
                }} />
              );
            })}
          </div>
        ))}
      </div>

      {/* 페이지 + 장바구니 */}
      <div style={{ background: '#fff', borderTop: '1px solid #eee', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ padding: '3px 8px', fontSize: 12, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 4, background: page === 0 ? '#f5f5f5' : '#fff' }}
          >◀</button>
          <span style={{ fontSize: 12, color: '#888' }}>{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{ padding: '3px 8px', fontSize: 12, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 4, background: page === totalPages - 1 ? '#f5f5f5' : '#fff' }}
          >▶</button>
        </div>
        <button style={{ background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
          결제하기
        </button>
      </div>
    </div>
  );
}
