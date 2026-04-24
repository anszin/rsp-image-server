import React, { useState } from 'react';
import { MenuEditorPage } from './pages/MenuEditorPage';
import { AdminPage } from './pages/AdminPage';
import { SlotEditorPage } from './pages/SlotEditorPage';

type Page = 'menu-editor' | 'admin' | 'slot-editor';

function App() {
  const [page, setPage] = useState<Page>('menu-editor');
  const [slotCtx, setSlotCtx] = useState<{ menuId: number; storeId: number; menuName: string } | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Pretendard' }}>
      {/* GNB */}
      <div style={{ height: 44, background: '#1e2a3a', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 4, flexShrink: 0 }}>
        <span style={{ color: '#ff6b35', fontWeight: 700, fontSize: 15, marginRight: 16 }}>F&B Menu</span>
        <NavBtn active={page === 'menu-editor'} onClick={() => setPage('menu-editor')}>메뉴 관리</NavBtn>
        <NavBtn active={page === 'admin'} onClick={() => setPage('admin')}>관리자</NavBtn>
        {slotCtx && (
          <NavBtn active={page === 'slot-editor'} onClick={() => setPage('slot-editor')}>
            슬롯 편집 ({slotCtx.menuName})
          </NavBtn>
        )}
      </div>

      {/* 컨텐츠 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {page === 'menu-editor' && (
          <MenuEditorPage onOpenSlotEditor={(menuId, storeId, menuName) => {
            setSlotCtx({ menuId, storeId, menuName });
            setPage('slot-editor');
          }} />
        )}
        {page === 'admin' && <AdminPage />}
        {page === 'slot-editor' && slotCtx && (
          <SlotEditorPage menuId={slotCtx.menuId} storeId={slotCtx.storeId} menuName={slotCtx.menuName} />
        )}
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 14px', border: 'none', borderRadius: 5,
      background: active ? '#ff6b35' : 'transparent',
      color: active ? '#fff' : '#aaa',
      cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 400,
    }}>{children}</button>
  );
}

export default App;
