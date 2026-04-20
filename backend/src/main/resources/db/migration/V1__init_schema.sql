-- ============================================================
-- F&B POS 메뉴 관리 플랫폼 초기 스키마
-- ============================================================

-- 고객사(Tenant)
CREATE TABLE food_tenant (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE
);

-- 매장(Store)
CREATE TABLE food_store (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(50)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    address     VARCHAR(255),
    description VARCHAR(500),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    tenant_id   BIGINT       NOT NULL REFERENCES food_tenant(id)
);

-- 메뉴판(Menu)
CREATE TABLE food_menu (
    id       BIGSERIAL PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    active   BOOLEAN      NOT NULL DEFAULT TRUE,
    store_id BIGINT       NOT NULL REFERENCES food_store(id)
);

-- 카테고리(Category)
CREATE TABLE food_category (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    sort_order INTEGER      NOT NULL DEFAULT 0,
    menu_id    BIGINT       NOT NULL REFERENCES food_menu(id)
);

-- 메뉴 아이템(Item)
CREATE TABLE food_item (
    id           BIGSERIAL PRIMARY KEY,
    product_code VARCHAR(30)    NOT NULL UNIQUE,
    name         VARCHAR(100)   NOT NULL,
    price        NUMERIC(10, 0) NOT NULL,
    status       VARCHAR(20)    NOT NULL DEFAULT 'ON_SALE',
    sort_order   INTEGER        NOT NULL DEFAULT 0,
    category_id  BIGINT         NOT NULL REFERENCES food_category(id)
);

-- 아이템 이미지(ItemImage)
CREATE TABLE food_item_image (
    id         BIGSERIAL PRIMARY KEY,
    url        VARCHAR(500) NOT NULL,
    sort_order INTEGER      NOT NULL DEFAULT 0,
    item_id    BIGINT       NOT NULL REFERENCES food_item(id)
);

-- 옵션 그룹(ItemOptionGroup)
CREATE TABLE food_item_option_group (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(50) NOT NULL,
    required     BOOLEAN     NOT NULL DEFAULT FALSE,
    multi_select BOOLEAN     NOT NULL DEFAULT FALSE,
    sort_order   INTEGER     NOT NULL DEFAULT 0,
    item_id      BIGINT      NOT NULL REFERENCES food_item(id)
);

-- 옵션 값(ItemOptionValue)
CREATE TABLE food_item_option_value (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50)    NOT NULL,
    extra_price     NUMERIC(10, 0) NOT NULL DEFAULT 0,
    sort_order      INTEGER        NOT NULL DEFAULT 0,
    option_group_id BIGINT         NOT NULL REFERENCES food_item_option_group(id)
);

-- 화면 레이아웃(DisplayLayout) - 매장당 1개
CREATE TABLE food_display_layout (
    id          BIGSERIAL PRIMARY KEY,
    orientation VARCHAR(20) NOT NULL DEFAULT 'LANDSCAPE',
    columns     INTEGER     NOT NULL DEFAULT 4,
    rows        INTEGER     NOT NULL DEFAULT 3,
    store_id    BIGINT      NOT NULL UNIQUE REFERENCES food_store(id)
);

-- 메뉴판 슬롯(ItemSlot) - 메뉴판의 격자 위치
CREATE TABLE food_item_slot (
    id      BIGSERIAL PRIMARY KEY,
    page    INTEGER NOT NULL DEFAULT 0,
    row_idx INTEGER NOT NULL,
    col_idx INTEGER NOT NULL,
    menu_id BIGINT  NOT NULL REFERENCES food_menu(id),
    item_id BIGINT  REFERENCES food_item(id),
    UNIQUE (menu_id, page, row_idx, col_idx)
);

-- 인덱스
CREATE INDEX idx_food_store_tenant_id    ON food_store(tenant_id);
CREATE INDEX idx_food_menu_store_id      ON food_menu(store_id);
CREATE INDEX idx_food_category_menu_id   ON food_category(menu_id);
CREATE INDEX idx_food_item_category_id   ON food_item(category_id);
CREATE INDEX idx_food_item_image_item_id ON food_item_image(item_id);
CREATE INDEX idx_food_option_group_item  ON food_item_option_group(item_id);
CREATE INDEX idx_food_option_value_group ON food_item_option_value(option_group_id);
CREATE INDEX idx_food_item_slot_menu     ON food_item_slot(menu_id);
