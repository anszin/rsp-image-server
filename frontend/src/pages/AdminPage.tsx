import React, { useEffect, useState } from 'react';
import { tenantApi, storeApi, TenantDto, StoreDto } from '../api/storeApi';

type View = 'tenant-list' | 'tenant-form' | 'store-form';

export function AdminPage() {
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [expandedTenant, setExpandedTenant] = useState<number | null>(null);
  const [tenantStores, setTenantStores] = useState<Record<number, StoreDto[]>>({});
  const [view, setView] = useState<View>('tenant-list');
  const [editingTenant, setEditingTenant] = useState<TenantDto | null>(null);
  const [editingStore, setEditingStore] = useState<StoreDto | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

  // 고객사 폼 상태
  const [tCode, setTCode] = useState('');
  const [tName, setTName] = useState('');
  const [tActive, setTActive] = useState(true);

  // 매장 폼 상태
  const [sCode, setSCode] = useState('');
  const [sName, setSName] = useState('');
  const [sAddress, setSAddress] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sActive, setSActive] = useState(true);

  useEffect(() => { loadTenants(); }, []);

  const loadTenants = () => tenantApi.list().then(setTenants);

  const toggleTenant = async (id: number) => {
    if (expandedTenant === id) { setExpandedTenant(null); return; }
    setExpandedTenant(id);
    if (!tenantStores[id]) {
      const stores = await tenantApi.stores(id);
      setTenantStores(prev => ({ ...prev, [id]: stores }));
    }
  };

  const openTenantForm = (t?: TenantDto) => {
    setEditingTenant(t ?? null);
    setTCode(t?.code ?? ''); setTName(t?.name ?? ''); setTActive(t?.active ?? true);
    setView('tenant-form');
  };

  const openStoreForm = (tenantId: number, s?: StoreDto) => {
    setSelectedTenantId(tenantId);
    setEditingStore(s ?? null);
    setSCode(s?.code ?? ''); setSName(s?.name ?? '');
    setSAddress(s?.address ?? ''); setSDesc(s?.description ?? ''); setSActive(s?.active ?? true);
    setView('store-form');
  };

  const saveTenant = async () => {
    if (!tCode.trim() || !tName.trim()) { alert('코드와 이름을 입력하세요.'); return; }
    try {
      if (editingTenant) {
        await tenantApi.update(editingTenant.id, { code: tCode, name: tName, active: tActive });
      } else {
        await tenantApi.create({ code: tCode, name: tName });
      }
      await loadTenants();
      setView('tenant-list');
    } catch (e: any) {
      alert(e.response?.data?.message ?? e.message ?? '저장 실패. 서버 연결을 확인하세요.');
    }
  };

  const deleteTenant = async (id: number) => {
    if (!window.confirm('고객사를 삭제하시겠습니까?')) return;
    try {
      await tenantApi.delete(id);
      await loadTenants();
    } catch (e: any) { alert(e.response?.data?.message ?? '삭제 실패'); }
  };

  const saveStore = async () => {
    if (!sCode.trim() || !sName.trim()) { alert('코드와 이름을 입력하세요.'); return; }
    try {
      if (editingStore) {
        await storeApi.update(editingStore.id, { code: sCode, name: sName, address: sAddress, description: sDesc, active: sActive });
      } else {
        await storeApi.create({ tenantId: selectedTenantId ?? undefined, code: sCode, name: sName, address: sAddress, description: sDesc });
      }
      if (selectedTenantId) {
        const stores = await tenantApi.stores(selectedTenantId);
        setTenantStores(prev => ({ ...prev, [selectedTenantId]: stores }));
      }
      setView('tenant-list');
    } catch (e: any) {
      alert(e.response?.data?.message ?? e.message ?? '저장 실패. 서버 연결을 확인하세요.');
    }
  };

  const deleteStore = async (tenantId: number, storeId: number) => {
    if (!window.confirm('매장을 삭제하시겠습니까?')) return;
    await storeApi.delete(storeId);
    const stores = await tenantApi.stores(tenantId);
    setTenantStores(prev => ({ ...prev, [tenantId]: stores }));
  };

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'Pretendard' }}>
      {/* 좌측 트리 패널 */}
      <div style={{ width: 340, background: '#1e2a3a', color: '#e0e0e0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2d3f55', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>관리자</span>
          <button onClick={() => openTenantForm()} style={addBtnStyle}>+ 고객사</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tenants.length === 0 && (
            <div style={{ padding: 20, color: '#888', fontSize: 13 }}>등록된 고객사가 없습니다.</div>
          )}
          {tenants.map(t => (
            <div key={t.id}>
              {/* 고객사 행 */}
              <div style={{
                display: 'flex', alignItems: 'center', padding: '10px 16px',
                cursor: 'pointer', background: expandedTenant === t.id ? '#243447' : 'transparent',
                borderBottom: '1px solid #2d3f55',
              }}
                onClick={() => toggleTenant(t.id)}
              >
                <span style={{ marginRight: 8, fontSize: 11 }}>{expandedTenant === t.id ? '▼' : '▶'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{t.code} {!t.active && <span style={{ color: '#e57373' }}>미사용</span>}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => openTenantForm(t)} style={editBtnStyle}>수정</button>
                  <button onClick={() => deleteTenant(t.id)} style={delBtnStyle}>삭제</button>
                </div>
              </div>

              {/* 매장 목록 */}
              {expandedTenant === t.id && (
                <div style={{ background: '#182230' }}>
                  <div style={{ padding: '6px 16px 6px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#888' }}>매장</span>
                    <button onClick={() => openStoreForm(t.id)} style={addBtnStyle}>+ 매장</button>
                  </div>
                  {(tenantStores[t.id] ?? []).map(s => (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center',
                      padding: '8px 16px 8px 36px', borderTop: '1px solid #1e2a3a',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          {s.code} {!s.active && <span style={{ color: '#e57373' }}>미사용</span>}
                          {s.description && <span> · {s.description}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openStoreForm(t.id, s)} style={editBtnStyle}>수정</button>
                        <button onClick={() => deleteStore(t.id, s.id)} style={delBtnStyle}>삭제</button>
                      </div>
                    </div>
                  ))}
                  {(tenantStores[t.id] ?? []).length === 0 && (
                    <div style={{ padding: '8px 36px', fontSize: 12, color: '#666' }}>매장 없음</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 우측 편집 패널 */}
      <div style={{ flex: 1, background: '#f5f7fa', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 40, overflowY: 'auto' }}>
        {view === 'tenant-list' && (
          <div style={{ color: '#aaa', textAlign: 'center', marginTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
            <div>좌측에서 고객사를 선택하거나 추가하세요</div>
          </div>
        )}

        {view === 'tenant-form' && (
          <FormCard title={editingTenant ? '고객사 수정' : '고객사 추가'} onSave={saveTenant} onCancel={() => setView('tenant-list')}>
            <FormField label="고객사 코드 *">
              <input style={inputStyle} value={tCode} onChange={e => setTCode(e.target.value)} placeholder="예: TENANT001" disabled={!!editingTenant} />
            </FormField>
            <FormField label="고객사명 *">
              <input style={inputStyle} value={tName} onChange={e => setTName(e.target.value)} placeholder="예: (주)맛있는커피" />
            </FormField>
            {editingTenant && (
              <FormField label="사용구분">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={tActive} onChange={e => setTActive(e.target.checked)} />
                  사용중
                </label>
              </FormField>
            )}
          </FormCard>
        )}

        {view === 'store-form' && (
          <FormCard title={editingStore ? '매장 수정' : '매장 추가'} onSave={saveStore} onCancel={() => setView('tenant-list')}>
            <FormField label="매장 코드 *">
              <input style={inputStyle} value={sCode} onChange={e => setSCode(e.target.value)} placeholder="예: STORE001" disabled={!!editingStore} />
            </FormField>
            <FormField label="매장명 *">
              <input style={inputStyle} value={sName} onChange={e => setSName(e.target.value)} placeholder="예: 강남점" />
            </FormField>
            <FormField label="주소">
              <input style={inputStyle} value={sAddress} onChange={e => setSAddress(e.target.value)} placeholder="예: 서울시 강남구" />
            </FormField>
            <FormField label="소개 문구">
              <input style={inputStyle} value={sDesc} onChange={e => setSDesc(e.target.value)} placeholder="예: 강남 1호 직영점" />
            </FormField>
            <FormField label="사용구분">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" checked={sActive} onChange={e => setSActive(e.target.checked)} />
                사용중
              </label>
            </FormField>
          </FormCard>
        )}
      </div>
    </div>
  );
}

function FormCard({ title, children, onSave, onCancel }: { title: string; children: React.ReactNode; onSave: () => void; onCancel: () => void }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 440, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={cancelBtnStyle}>취소</button>
          <button onClick={onSave} style={saveBtnStyle}>저장</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };
const saveBtnStyle: React.CSSProperties = { padding: '7px 18px', background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 };
const cancelBtnStyle: React.CSSProperties = { padding: '7px 18px', background: '#f5f5f5', color: '#666', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const addBtnStyle: React.CSSProperties = { padding: '4px 10px', background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 };
const editBtnStyle: React.CSSProperties = { padding: '3px 8px', background: '#2d3f55', color: '#aaa', border: '1px solid #3d5066', borderRadius: 4, cursor: 'pointer', fontSize: 11 };
const delBtnStyle: React.CSSProperties = { padding: '3px 8px', background: 'transparent', color: '#e57373', border: '1px solid #3d5066', borderRadius: 4, cursor: 'pointer', fontSize: 11 };
