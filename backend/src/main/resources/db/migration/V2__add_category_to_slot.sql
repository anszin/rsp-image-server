-- 기존 슬롯 데이터 전체 삭제 (카테고리별 모델로 전환)
DELETE FROM food_item_slot;

-- category_id 컬럼 추가
ALTER TABLE food_item_slot
    ADD COLUMN category_id BIGINT NOT NULL REFERENCES food_category(id) ON DELETE CASCADE;

-- 기존 UNIQUE 제약 삭제
ALTER TABLE food_item_slot
    DROP CONSTRAINT food_item_slot_menu_id_page_row_idx_col_idx_key;

-- 카테고리 포함 새 UNIQUE 제약 추가
ALTER TABLE food_item_slot
    ADD CONSTRAINT uq_food_item_slot_pos UNIQUE (menu_id, category_id, page, row_idx, col_idx);

-- 인덱스 추가
CREATE INDEX idx_food_item_slot_category ON food_item_slot(category_id);
