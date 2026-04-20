import React, { useState } from 'react';
import { Item, OptionGroup, OptionValue } from '../../types/menu';

interface Props {
  item: Partial<Item>;
}

export function PosPreview({ item }: Props) {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});

  const toggleOption = (groupIdx: number, valueIdx: number, multiSelect: boolean) => {
    setSelectedOptions(prev => {
      const current = prev[groupIdx] ?? [];
      if (multiSelect) {
        return {
          ...prev,
          [groupIdx]: current.includes(valueIdx)
            ? current.filter(i => i !== valueIdx)
            : [...current, valueIdx],
        };
      }
      return { ...prev, [groupIdx]: [valueIdx] };
    });
  };

  const totalExtra = (item.optionGroups ?? []).reduce((sum, g, gi) => {
    const sel = selectedOptions[gi] ?? [];
    return sum + g.values.filter((_, vi) => sel.includes(vi)).reduce((s, v) => s + v.extraPrice, 0);
  }, 0);

  const basePrice = item.price ?? 0;

  return (
    <div
      style={{
        width: 400,
        border: '2px solid #333',
        borderRadius: 8,
        fontFamily: 'monospace',
        background: '#1a1a2e',
        color: '#e0e0e0',
        overflow: 'hidden',
      }}
    >
      {/* POS 헤더 */}
      <div style={{ background: '#16213e', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#4fc3f7', fontWeight: 700, fontSize: 14 }}>POS 단말기</span>
        <span style={{ color: '#888', fontSize: 12 }}>매장모드</span>
      </div>

      {/* 상품 정보 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #333' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{item.name || '상품명'}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: 12 }}>{item.productCode || '-'}</span>
          <span style={{ color: '#ffd700', fontWeight: 700 }}>{basePrice.toLocaleString()}원</span>
        </div>
      </div>

      {/* 옵션 선택 */}
      {(item.optionGroups ?? []).length > 0 && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #333' }}>
          <div style={{ color: '#4fc3f7', fontSize: 12, marginBottom: 8 }}>옵션 선택</div>
          {(item.optionGroups ?? []).map((g, gi) => (
            <div key={gi} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>
                {g.name}
                {g.required && <span style={{ color: '#ff6b6b', marginLeft: 4 }}>*필수</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {g.values.map((v, vi) => {
                  const selected = (selectedOptions[gi] ?? []).includes(vi);
                  return (
                    <button
                      key={vi}
                      onClick={() => toggleOption(gi, vi, g.multiSelect)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 4,
                        border: `1px solid ${selected ? '#4fc3f7' : '#555'}`,
                        background: selected ? '#4fc3f7' : 'transparent',
                        color: selected ? '#000' : '#ddd',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {v.name}{v.extraPrice > 0 && ` +${v.extraPrice.toLocaleString()}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 합계 */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#aaa', fontSize: 13 }}>합계</span>
        <span style={{ color: '#ffd700', fontWeight: 700, fontSize: 18 }}>
          {(basePrice + totalExtra).toLocaleString()}원
        </span>
      </div>

      {/* 주문 버튼 */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
        <button style={{ flex: 1, padding: '10px', background: '#555', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
          취소
        </button>
        <button style={{ flex: 2, padding: '10px', background: '#4fc3f7', border: 'none', color: '#000', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
          주문 추가
        </button>
      </div>
    </div>
  );
}
