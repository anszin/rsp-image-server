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

interface Props {
  onOpenSlotEditor?: (menuId: number, storeId: number, menuName: string) => void;
}

export function MenuEditorPage({ onOpenSlotEditor }: Props) {
  const { draft, setField, previewMode, setPreviewMode, reset } = useEditorStore();
  const { setLayout } = useLayoutStore();

  // 선택 상태
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantDto | null>(null);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreDto | null>(null);
  const [menus, setMenus] = useState<MenuDto[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [previewItems, setPreviewItems] = useState<Item[]>([]);

  // 메뉴판 관리 상태
  const [showMenuMgr, setShowMenuMgr] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [editingMenu, setEditingMenu] = useState<{ id: number; name: string } | null>(null);

  // 카테고리 관리 모달 상태
  const [showCatMgr, setShowCatMgr] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<{ id: number; name: string } | null>(null);

  // 초기: 고객사 목록
  useEffect(() => {
    tenantApi.list().then(setTenants).catch(() => {});
  }, []);

  // 고객사 선택 시 해당 고객사의 매장만 조회
  useEffect(() => {
    if (!selectedTenant) { setStores([]); setSelectedStore(null); return; }
    tenantApi.stores(selectedTenant.id).then(list => {
      setStores(list.filter(s => s.active));
      setSelectedStore(null);
      setSelectedMenu(null);
      setCategories([]);
    }).catch(() => {});
  }, [selectedTenant]);

  // 매장 선택 시 메뉴 + 레이아웃 조회
  useEffect(() => {
    if (!selectedStore) return;
    menuApi.list(selectedStore.id).then(list => {
      setMenus(list);
      if (list.length > 0) setSelectedMenu(list[0]);
    });
    layoutApi.get(selectedStore.id).then(setLayout).catch(() => {});
  }, [selectedStore, setLayout]);

  // 메뉴 선택 시 카테고리 + 전체 상품 조회
  useEffect(() => {
    if (!selectedStore || !selectedMenu) return;
    categoryApi2.list(selectedStore.id, selectedMenu.id).then(setCategories);
    itemApi.listByMenu(selectedMenu.id).then(setPreviewItems).catch(() => {});
  }, [selectedStore, selectedMenu]);

  const refreshItems = (categoryId?: number) => {
    if (categoryId) {
      itemApi.listByCategory(categoryId).then(setPreviewItems).catch(() => {});
    } else if (selectedMenu) {
      itemApi.listByMenu(selectedMenu.id).then(setPreviewItems).catch(() => {});
    }
  };

  const handleSave = async () => {
    try {
      const savedCategoryId = draft.categoryId;
      if (draft.id) {
        await itemApi.update(draft.id, draft);
        alert('저장되었습니다.');
      } else {
        await itemApi.create(draft);
        alert('등록되었습니다.');
        reset();
      }
      refreshItems(savedCategoryId);
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
  };

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'Pretendard', background: '#f5f7fa' }}>

      {/* ── 좌측: 편집 패널 ── */}
      <div style={{ width: 440, background: '#fff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* 헤더 */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{draft.id ? '상품 수정' : '상품 등록'}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={reset} style={cancelBtnStyle}>취소</button>
            <button onClick={handleSave} style={saveBtnStyle}>저장</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── 점포 선택 ── */}
          <Section title="점포 선택">
            {/* 1단계: 고객사 */}
            <select style={inputStyle} value={selectedTenant?.id ?? ''}
              onChange={e => {
                const t = tenants.find(t => t.id === Number(e.target.value)) ?? null;
                setSelectedTenant(t);
              }}>
              <option value="">고객사 선택</option>
              {tenants.filter(t => t.active).map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>

            {/* 2단계: 매장 (고객사 선택 후) */}
            {selectedTenant && (
              <select style={{ ...inputStyle, marginTop: 6 }} value={selectedStore?.id ?? ''}
                onChange={e => {
                  const s = stores.find(s => s.id === Number(e.target.value)) ?? null;
                  setSelectedStore(s);
                  setSelectedMenu(null);
                  setCategories([]);
                }}>
                <option value="">매장 선택</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            )}

            {/* 3단계: 메뉴판 (매장 선택 후) */}
            {selectedStore && (
              <>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <select style={{ ...inputStyle, flex: 1 }} value={selectedMenu?.id ?? ''}
                    onChange={e => {
                      const m = menus.find(m => m.id === Number(e.target.value)) ?? null;
                      setSelectedMenu(m);
                    }}>
                    <option value="">메뉴판 선택</option>
                    {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <button onClick={() => setShowMenuMgr(v => !v)} style={subBtnStyle}>
                    {showMenuMgr ? '닫기' : '관리'}
                  </button>
                </div>

                {showMenuMgr && (
                  <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 10, marginTop: 4 }}>
                    {menus.map(m => (
                      <div key={m.id} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                        {editingMenu?.id === m.id ? (
                          <>
                            <input style={{ ...inputStyle, flex: 1 }} value={editingMenu.name}
                              onChange={e => setEditingMenu({ ...editingMenu, name: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && handleUpdateMenu()} />
                            <button onClick={handleUpdateMenu} style={subBtnStyle}>저장</button>
                            <button onClick={() => setEditingMenu(null)} style={deleteBtnStyle}>취소</button>
                          </>
                        ) : (
                          <>
                            <span style={{ flex: 1, fontSize: 13 }}>{m.name}</span>
                            <button onClick={() => setEditingMenu({ id: m.id, name: m.name })} style={subBtnStyle}>수정</button>
                            <button onClick={() => handleDeleteMenu(m.id)} style={deleteBtnStyle}>삭제</button>
                          </>
                        )}
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <input style={{ ...inputStyle, flex: 1 }} placeholder="새 메뉴판명"
                        value={newMenuName} onChange={e => setNewMenuName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddMenu()} />
                      <button onClick={handleAddMenu} style={subBtnStyle}>추가</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Section>

          {/* ── 카테고리 선택 + 관리 ── */}
          {selectedMenu && (
            <Section title="카테고리">
              <div style={{ display: 'flex', gap: 6 }}>
                <select style={{ ...inputStyle, flex: 1 }}
                  value={draft.categoryId ?? ''}
                  onChange={e => {
                    const id = Number(e.target.value);
                    setField('categoryId', id);
                    setField('categoryName', categories.find(c => c.id === id)?.name);
                    if (id) refreshItems(id);
                  }}>
                  <option value="">카테고리 선택</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={() => setShowCatMgr(v => !v)} style={subBtnStyle}>
                  {showCatMgr ? '닫기' : '관리'}
                </button>
              </div>

              {showCatMgr && (
                <div style={{ marginTop: 8, border: '1px solid #e0e0e0', borderRadius: 8, padding: 10 }}>
                  {/* 기존 카테고리 목록 */}
                  {categories.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                      {editingCat?.id === c.id ? (
                        <>
                          <input style={{ ...inputStyle, flex: 1 }} value={editingCat.name}
                            onChange={e => setEditingCat({ ...editingCat, name: e.target.value })} />
                          <button onClick={handleUpdateCategory} style={subBtnStyle}>저장</button>
                          <button onClick={() => setEditingCat(null)} style={deleteBtnStyle}>취소</button>
                        </>
                      ) : (
                        <>
                          <span style={{ flex: 1, fontSize: 13 }}>{c.name}</span>
                          <button onClick={() => setEditingCat({ id: c.id, name: c.name })} style={subBtnStyle}>수정</button>
                          <button onClick={() => handleDeleteCategory(c.id)} style={deleteBtnStyle}>삭제</button>
                        </>
                      )}
                    </div>
                  ))}
                  {/* 새 카테고리 추가 */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="새 카테고리명"
                      value={newCatName} onChange={e => setNewCatName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCategory()} />
                    <button onClick={handleAddCategory} style={subBtnStyle}>추가</button>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* ── 상품 정보 ── */}
          <Section title="상품 정보">
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
          </Section>

          <ImageUploader />
          <OptionGroupEditor />

          {/* ── 슬롯 편집 진입 ── */}
          {selectedMenu && onOpenSlotEditor && (
            <button
              onClick={() => onOpenSlotEditor(selectedMenu.id, selectedStore!.id, selectedMenu.name)}
              style={{ padding: '10px', background: '#1e2a3a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
            >
              🗂 메뉴판 슬롯 편집
            </button>
          )}
        </div>
      </div>

      {/* ── 우측: 프리뷰 + 레이아웃 패널 ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>

        {/* 프리뷰 영역 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
            {(['KIOSK', 'POS', 'QR'] as const).map(mode => (
              <button key={mode} onClick={() => setPreviewMode(mode)} style={{
                padding: '8px 24px', border: 'none',
                background: previewMode === mode ? '#ff6b35' : '#fff',
                color: previewMode === mode ? '#fff' : '#666',
                fontWeight: previewMode === mode ? 700 : 400,
                cursor: 'pointer', fontSize: 13,
              }}>
                {mode === 'QR' ? 'QR오더' : mode}
              </button>
            ))}
          </div>

          <div style={{ color: '#aaa', fontSize: 11, marginBottom: 16 }}>
            ※ 단말기에 실제로 표시되는 화면입니다
          </div>

          {previewMode === 'KIOSK' && <KioskPreview item={draft} allItems={previewItems} categories={categories} activeCategoryId={draft.categoryId ?? null} />}
          {previewMode === 'POS' && <PosPreview item={draft} />}
          {previewMode === 'QR' && (
            <div style={{ color: '#aaa', padding: 40, textAlign: 'center' }}>
              QR오더 프리뷰는 추후 구현 예정입니다
            </div>
          )}
        </div>

        {/* 레이아웃 설정 영역 */}
        {selectedStore && (
          <div style={{ width: 260, borderLeft: '1px solid #e0e0e0', background: '#fff', padding: '16px', overflowY: 'auto', flexShrink: 0 }}>
            <LayoutSettingPanel storeId={selectedStore.id} />
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px',
  border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
};
const saveBtnStyle: React.CSSProperties = {
  padding: '6px 16px', background: '#ff6b35', color: '#fff',
  border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13,
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '6px 16px', background: '#f5f5f5', color: '#666',
  border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13,
};
const subBtnStyle: React.CSSProperties = {
  padding: '5px 10px', background: '#f0f7ff', border: '1px solid #4fc3f7',
  borderRadius: 5, color: '#0288d1', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
};
const deleteBtnStyle: React.CSSProperties = {
  padding: '5px 10px', background: '#fff0f0', border: '1px solid #ffcdd2',
  borderRadius: 5, color: '#e53935', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
};
