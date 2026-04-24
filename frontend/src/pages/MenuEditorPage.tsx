import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useLayoutStore } from '../store/layoutStore';
import { OptionGroupEditor } from '../components/editor/OptionGroupEditor';
import { ImageUploader } from '../components/editor/ImageUploader';
import { LayoutSettingPanel } from '../components/editor/LayoutSettingPanel';
import { KioskPreview } from '../components/preview/KioskPreview';
import { PosPreview } from '../components/preview/PosPreview';
import { itemApi } from '../api/itemApi';
import { tenantApi, menuApi, categoryApi2, layoutApi, TenantDto, StoreDto, MenuDto, CategoryDto } from '../api/storeApi';
import { Item, ItemStatus } from '../types/menu';

type MainTab = 'products' | 'layout';

interface Props {
  onOpenSlotEditor?: (menuId: number, storeId: number, menuName: string) => void;
}

export function MenuEditorPage({ onOpenSlotEditor }: Props) {
  const { draft, setField, previewMode, setPreviewMode, reset, loadItem } = useEditorStore();
  const { setLayout } = useLayoutStore();

  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantDto | null>(null);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreDto | null>(null);
  const [menus, setMenus] = useState<MenuDto[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [previewItems, setPreviewItems] = useState<Item[]>([]);

  const [mainTab, setMainTab] = useState<MainTab>('products');
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);

  const [showMenuMgr, setShowMenuMgr] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [editingMenu, setEditingMenu] = useState<{ id: number; name: string } | null>(null);

  const [showCatMgr, setShowCatMgr] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    tenantApi.list().then(setTenants).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTenant) { setStores([]); setSelectedStore(null); return; }
    tenantApi.stores(selectedTenant.id).then(list => {
      setStores(list.filter(s => s.active));
      setSelectedStore(null);
      setSelectedMenu(null);
      setCategories([]);
      setPreviewItems([]);
    }).catch(() => {});
  }, [selectedTenant]);

  useEffect(() => {
    if (!selectedStore) return;
    menuApi.list(selectedStore.id).then(list => {
      setMenus(list);
      if (list.length > 0) setSelectedMenu(list[0]);
    });
    layoutApi.get(selectedStore.id).then(setLayout).catch(() => {});
  }, [selectedStore, setLayout]);

  useEffect(() => {
    if (!selectedStore || !selectedMenu) return;
    categoryApi2.list(selectedStore.id, selectedMenu.id).then(setCategories);
    itemApi.listByMenu(selectedMenu.id).then(setPreviewItems).catch(() => {});
  }, [selectedStore, selectedMenu]);

  const refreshItems = () => {
    if (selectedMenu) {
      itemApi.listByMenu(selectedMenu.id).then(setPreviewItems).catch(() => {});
    }
  };

  const filteredItems = filterCategoryId
    ? previewItems.filter(i => i.categoryId === filterCategoryId)
    : previewItems;

  const categoryCount = (catId: number) =>
    previewItems.filter(i => i.categoryId === catId).length;

  const handleSave = async () => {
    try {
      if (draft.id) {
        const updated = await itemApi.update(draft.id, draft);
        loadItem(updated);
        alert('저장되었습니다.');
      } else {
        await itemApi.create(draft);
        alert('등록되었습니다.');
        reset();
      }
      refreshItems();
    } catch (e: any) {
      alert('오류: ' + (e.response?.data?.message ?? e.message));
    }
  };

  const handleDelete = async () => {
    if (!draft.id) return;
    if (!window.confirm(`'${draft.name}' 상품을 삭제할까요?`)) return;
    try {
      await itemApi.delete(draft.id);
      alert('삭제되었습니다.');
      reset();
      refreshItems();
    } catch (e: any) {
      alert('오류: ' + (e.response?.data?.message ?? e.message));
    }
  };

  const refreshMenus = async () => {
    if (!selectedStore) return;
    const list = await menuApi.list(selectedStore.id);
    setMenus(list);
    return list;
  };

  const handleAddMenu = async () => {
    if (!selectedStore || !newMenuName.trim()) return;
    const created = await menuApi.create(selectedStore.id, newMenuName.trim());
    setNewMenuName('');
    const list = await refreshMenus();
    setSelectedMenu(list?.find(m => m.id === created.id) ?? null);
  };

  const handleUpdateMenu = async () => {
    if (!selectedStore || !editingMenu) return;
    await menuApi.update(selectedStore.id, editingMenu.id, editingMenu.name);
    setEditingMenu(null);
    await refreshMenus();
  };

  const handleDeleteMenu = async (menuId: number) => {
    if (!selectedStore) return;
    if (!window.confirm('메뉴판을 삭제하면 하위 카테고리와 상품 배치도 모두 삭제됩니다. 계속할까요?')) return;
    try {
      await menuApi.delete(selectedStore.id, menuId);
      if (selectedMenu?.id === menuId) setSelectedMenu(null);
      await refreshMenus();
    } catch (e: any) { alert(e.response?.data?.message ?? '삭제 실패'); }
  };

  const handleAddCategory = async () => {
    if (!selectedStore || !selectedMenu || !newCatName.trim()) return;
    const cat = await categoryApi2.create(selectedStore.id, selectedMenu.id, newCatName.trim());
    setCategories(prev => [...prev, cat]);
    setNewCatName('');
  };

  const handleUpdateCategory = async () => {
    if (!selectedStore || !selectedMenu || !editingCat) return;
    const updated = await categoryApi2.update(selectedStore.id, selectedMenu.id, editingCat.id, editingCat.name, 0);
    setCategories(prev => prev.map(c => c.id === editingCat.id ? updated : c));
    setEditingCat(null);
  };

  const handleDeleteCategory = async (catId: number) => {
    if (!selectedStore || !selectedMenu) return;
    if (!window.confirm('카테고리를 삭제하면 하위 상품도 삭제됩니다. 계속할까요?')) return;
    await categoryApi2.delete(selectedStore.id, selectedMenu.id, catId);
    setCategories(prev => prev.filter(c => c.id !== catId));
    if (filterCategoryId === catId) setFilterCategoryId(null);
  };

  const statusLabel = (s?: string) =>
    s === 'ON_SALE' ? '판매중' : s === 'SOLD_OUT' ? '품절' : '숨김';
  const statusColor = (s?: string) =>
    s === 'ON_SALE' ? { bg: '#e8f5e9', text: '#2e7d32' }
      : s === 'SOLD_OUT' ? { bg: '#fce4ec', text: '#c62828' }
      : { bg: '#f5f5f5', text: '#757575' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Pretendard', background: '#f5f7fa' }}>

      {/* ── 상단 헤더 ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
        {/* 메인 헤더 행 */}
        <div style={{ height: 50, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
          {/* 점포 선택 */}
          <select style={hSelectStyle} value={selectedTenant?.id ?? ''}
            onChange={e => setSelectedTenant(tenants.find(t => t.id === Number(e.target.value)) ?? null)}>
            <option value="">고객사 선택</option>
            {tenants.filter(t => t.active).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {selectedTenant && <>
            <span style={{ color: '#ccc', fontSize: 16 }}>›</span>
            <select style={hSelectStyle} value={selectedStore?.id ?? ''}
              onChange={e => {
                const s = stores.find(s => s.id === Number(e.target.value)) ?? null;
                setSelectedStore(s);
                setSelectedMenu(null);
                setCategories([]);
                setPreviewItems([]);
              }}>
              <option value="">매장 선택</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </>}

          {selectedStore && <>
            <span style={{ color: '#ccc', fontSize: 16 }}>›</span>
            <select style={hSelectStyle} value={selectedMenu?.id ?? ''}
              onChange={e => setSelectedMenu(menus.find(m => m.id === Number(e.target.value)) ?? null)}>
              <option value="">메뉴판 선택</option>
              {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button onClick={() => setShowMenuMgr(v => !v)} style={hBtnStyle}>
              {showMenuMgr ? '닫기' : '메뉴판 관리'}
            </button>
          </>}

          <div style={{ flex: 1 }} />

          {/* 탭 전환 */}
          <div style={{ display: 'flex', border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden' }}>
            {([['products', '상품 관리'], ['layout', '메뉴 배치']] as [MainTab, string][]).map(([tab, label]) => (
              <button key={tab} onClick={() => setMainTab(tab)} style={{
                padding: '6px 20px', border: 'none',
                background: mainTab === tab ? '#ff6b35' : '#fff',
                color: mainTab === tab ? '#fff' : '#555',
                fontWeight: mainTab === tab ? 700 : 400,
                cursor: 'pointer', fontSize: 13,
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* 메뉴판 관리 서브 행 */}
        {showMenuMgr && selectedStore && (
          <div style={{ borderTop: '1px solid #f0f0f0', padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', background: '#fafafa' }}>
            {menus.map(m => (
              <div key={m.id} style={{ display: 'flex', gap: 4, alignItems: 'center', background: '#fff', padding: '4px 8px', borderRadius: 6, border: '1px solid #e0e0e0' }}>
                {editingMenu?.id === m.id ? (
                  <>
                    <input style={{ ...hSelectStyle, width: 110 }} value={editingMenu.name}
                      onChange={e => setEditingMenu({ ...editingMenu, name: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleUpdateMenu()} />
                    <button onClick={handleUpdateMenu} style={smBtnStyle}>저장</button>
                    <button onClick={() => setEditingMenu(null)} style={delBtnStyle}>취소</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 13 }}>{m.name}</span>
                    <button onClick={() => setEditingMenu({ id: m.id, name: m.name })} style={iconBtnStyle}>✎</button>
                    <button onClick={() => handleDeleteMenu(m.id)} style={{ ...iconBtnStyle, color: '#e53935' }}>✕</button>
                  </>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 4 }}>
              <input style={{ ...hSelectStyle, width: 110 }} placeholder="새 메뉴판명"
                value={newMenuName} onChange={e => setNewMenuName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMenu()} />
              <button onClick={handleAddMenu} style={smBtnStyle}>+ 추가</button>
            </div>
          </div>
        )}
      </div>

      {/* ── 탭 컨텐츠 ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ━━━ 상품 관리 탭 ━━━ */}
        {mainTab === 'products' && (
          <>
            {/* 카테고리 사이드바 */}
            <div style={{ width: 148, background: '#fff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0', fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                카테고리
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
                <CatBtn active={filterCategoryId === null} onClick={() => setFilterCategoryId(null)}>
                  전체 ({previewItems.length})
                </CatBtn>
                {categories.map(c => (
                  <CatBtn key={c.id} active={filterCategoryId === c.id} onClick={() => setFilterCategoryId(c.id)}>
                    {c.name} ({categoryCount(c.id)})
                  </CatBtn>
                ))}
              </div>
              {selectedMenu && (
                <div style={{ padding: '8px 10px', borderTop: '1px solid #f0f0f0' }}>
                  <button onClick={() => setShowCatMgr(v => !v)} style={{
                    width: '100%', padding: '5px 0', border: '1px solid #4fc3f7',
                    borderRadius: 5, background: showCatMgr ? '#e3f2fd' : '#f0f7ff',
                    color: '#0288d1', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  }}>
                    카테고리 관리
                  </button>
                </div>
              )}
            </div>

            {/* 카테고리 관리 패널 */}
            {showCatMgr && selectedMenu && (
              <div style={{ width: 210, background: '#f8fbff', borderRight: '1px solid #dde8f5', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid #dde8f5', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>카테고리 관리</span>
                  <button onClick={() => setShowCatMgr(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#aaa', fontSize: 18, lineHeight: 1 }}>×</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                  {categories.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: 4, marginBottom: 6, alignItems: 'center' }}>
                      {editingCat?.id === c.id ? (
                        <>
                          <input style={{ ...inputStyle, flex: 1, fontSize: 12 }} value={editingCat.name}
                            onChange={e => setEditingCat({ ...editingCat, name: e.target.value })
                            } />
                          <button onClick={handleUpdateCategory} style={smBtnStyle}>저장</button>
                          <button onClick={() => setEditingCat(null)} style={delBtnStyle}>취소</button>
                        </>
                      ) : (
                        <>
                          <span style={{ flex: 1, fontSize: 13, color: '#333' }}>{c.name}</span>
                          <button onClick={() => setEditingCat({ id: c.id, name: c.name })} style={iconBtnStyle}>✎</button>
                          <button onClick={() => handleDeleteCategory(c.id)} style={{ ...iconBtnStyle, color: '#e53935' }}>✕</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '8px 10px', borderTop: '1px solid #dde8f5', display: 'flex', gap: 6 }}>
                  <input style={{ ...inputStyle, flex: 1, fontSize: 12 }} placeholder="새 카테고리명"
                    value={newCatName} onChange={e => setNewCatName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()} />
                  <button onClick={handleAddCategory} style={smBtnStyle}>추가</button>
                </div>
              </div>
            )}

            {/* 상품 목록 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, color: '#888' }}>
                  {filteredItems.length}개 상품
                  {filterCategoryId && categories.find(c => c.id === filterCategoryId) && (
                    <span style={{ marginLeft: 6, color: '#ff6b35', fontWeight: 600 }}>
                      — {categories.find(c => c.id === filterCategoryId)?.name}
                    </span>
                  )}
                </span>
                <button onClick={reset} style={saveBtnStyle}>+ 새 상품</button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                {!selectedMenu ? (
                  <Empty>메뉴판을 선택하세요</Empty>
                ) : filteredItems.length === 0 ? (
                  <Empty>등록된 상품이 없습니다</Empty>
                ) : filteredItems.map(item => {
                  const isSelected = draft.id === item.id;
                  const sc = statusColor(item.status);
                  return (
                    <div key={item.id} onClick={() => loadItem(item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', marginBottom: 5,
                        background: isSelected ? '#fff8f5' : '#fff',
                        border: `1px solid ${isSelected ? '#ff6b35' : '#e8e8e8'}`,
                        borderRadius: 8, cursor: 'pointer',
                        transition: 'border-color 0.15s',
                      }}>
                      {/* 썸네일 */}
                      <div style={{
                        width: 42, height: 42, borderRadius: 6, flexShrink: 0,
                        background: item.imageUrls?.[0] ? `url(${item.imageUrls[0]}) center/cover` : '#ffe8d6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      }}>
                        {!item.imageUrls?.[0] && '🍽️'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                          {categories.find(c => c.id === item.categoryId)?.name ?? '—'} · {item.productCode}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ color: '#ff6b35', fontWeight: 700, fontSize: 13 }}>{Number(item.price).toLocaleString()}원</div>
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, marginTop: 3, display: 'inline-block', background: sc.bg, color: sc.text }}>
                          {statusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 편집 폼 */}
            <div style={{ width: 340, background: '#fff', borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{draft.id ? '상품 수정' : '새 상품 등록'}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {draft.id && <button onClick={handleDelete} style={delBtnStyle}>삭제</button>}
                  <button onClick={reset} style={cancelBtnStyle}>{draft.id ? '새 상품' : '취소'}</button>
                  <button onClick={handleSave} style={saveBtnStyle}>저장</button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Field label="카테고리">
                  <select style={inputStyle} value={draft.categoryId ?? ''}
                    onChange={e => {
                      const id = Number(e.target.value);
                      setField('categoryId', id);
                      setField('categoryName', categories.find(c => c.id === id)?.name);
                    }}>
                    <option value="">카테고리 선택</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="상품명 *">
                  <input style={inputStyle} placeholder="예: 아메리카노" value={draft.name ?? ''}
                    onChange={e => setField('name', e.target.value)} />
                </Field>
                <Field label="상품코드 *">
                  <input style={inputStyle} placeholder="예: MN-001" value={draft.productCode ?? ''}
                    onChange={e => setField('productCode', e.target.value)} />
                </Field>
                <Field label="가격 (원) *">
                  <input style={inputStyle} type="number" min={0} placeholder="0"
                    value={draft.price ?? 0} onChange={e => setField('price', Number(e.target.value))} />
                </Field>
                <Field label="상태">
                  <select style={inputStyle} value={draft.status ?? 'ON_SALE'}
                    onChange={e => setField('status', e.target.value as ItemStatus)}>
                    <option value="ON_SALE">판매중</option>
                    <option value="SOLD_OUT">품절</option>
                    <option value="HIDDEN">숨김</option>
                  </select>
                </Field>
                <Field label="정렬순서">
                  <input style={inputStyle} type="number" min={0} value={draft.sortOrder ?? 0}
                    onChange={e => setField('sortOrder', Number(e.target.value))} />
                </Field>
                <ImageUploader />
                <OptionGroupEditor />
              </div>
            </div>
          </>
        )}

        {/* ━━━ 메뉴 배치 탭 ━━━ */}
        {mainTab === 'layout' && (
          <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, overflow: 'auto' }}>
              {/* 프리뷰 모드 탭 */}
              <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                {(['KIOSK', 'POS', 'QR'] as const).map(mode => (
                  <button key={mode} onClick={() => setPreviewMode(mode)} style={{
                    padding: '7px 22px', border: 'none',
                    background: previewMode === mode ? '#ff6b35' : '#fff',
                    color: previewMode === mode ? '#fff' : '#666',
                    fontWeight: previewMode === mode ? 700 : 400,
                    cursor: 'pointer', fontSize: 13,
                  }}>{mode === 'QR' ? 'QR오더' : mode}</button>
                ))}
              </div>

              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 14 }}>
                ※ 단말기에 실제로 표시되는 화면입니다
              </div>

              {previewMode === 'KIOSK' && (
                <KioskPreview item={draft} allItems={previewItems} categories={categories}
                  activeCategoryId={null}
                  onItemClick={item => { if (item.id) { loadItem(item as Item); setMainTab('products'); } }} />
              )}
              {previewMode === 'POS' && <PosPreview item={draft} />}
              {previewMode === 'QR' && (
                <div style={{ color: '#aaa', padding: 40, textAlign: 'center' }}>QR오더 프리뷰는 추후 구현 예정입니다</div>
              )}

              {selectedMenu && onOpenSlotEditor && (
                <button
                  onClick={() => onOpenSlotEditor(selectedMenu.id, selectedStore!.id, selectedMenu.name)}
                  style={{ marginTop: 20, padding: '10px 28px', background: '#1e2a3a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  🗂 슬롯 편집 (드래그&드롭 배치)
                </button>
              )}
            </div>

            {selectedStore && (
              <div style={{ width: 260, borderLeft: '1px solid #e0e0e0', background: '#fff', padding: 16, overflowY: 'auto', flexShrink: 0 }}>
                <LayoutSettingPanel storeId={selectedStore.id} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── 서브 컴포넌트 ──

function CatBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', padding: '7px 12px', textAlign: 'left',
      border: 'none', background: active ? '#fff3e0' : 'transparent',
      color: active ? '#ff6b35' : '#555', fontWeight: active ? 700 : 400,
      fontSize: 13, cursor: 'pointer', borderLeft: active ? '3px solid #ff6b35' : '3px solid transparent',
    }}>{children}</button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</label>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: 'center', color: '#bbb', fontSize: 13, paddingTop: 50 }}>{children}</div>;
}

// ── 스타일 ──

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px',
  border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
};
const hSelectStyle: React.CSSProperties = {
  padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: 5,
  fontSize: 13, background: '#fafafa', cursor: 'pointer',
};
const hBtnStyle: React.CSSProperties = {
  padding: '5px 10px', border: '1px solid #e0e0e0', borderRadius: 5,
  background: '#fff', fontSize: 12, cursor: 'pointer', color: '#555',
};
const saveBtnStyle: React.CSSProperties = {
  padding: '6px 14px', background: '#ff6b35', color: '#fff',
  border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13,
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '6px 12px', background: '#f5f5f5', color: '#666',
  border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13,
};
const delBtnStyle: React.CSSProperties = {
  padding: '5px 10px', background: '#fff0f0', border: '1px solid #ffcdd2',
  borderRadius: 5, color: '#e53935', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
};
const smBtnStyle: React.CSSProperties = {
  padding: '4px 8px', background: '#f0f7ff', border: '1px solid #4fc3f7',
  borderRadius: 4, color: '#0288d1', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
};
const iconBtnStyle: React.CSSProperties = {
  padding: '2px 5px', background: 'none', border: 'none',
  cursor: 'pointer', fontSize: 13, color: '#888',
};
