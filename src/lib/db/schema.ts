import {
	pgTable,
	text,
	timestamp,
	integer,
	customType,
} from "drizzle-orm/pg-core";

/**
 * bytea型のカスタムカラム定義
 * PostgreSQLのbytea型をBufferとして扱う
 */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
	dataType() {
		return "bytea";
	},
});

/**
 * メニュー写真テーブル
 * メニューの写真データを保存する
 */
export const menuPhotos = pgTable("menu_photos", {
	/**
	 * ID (自動採番)
	 * GENERATED ALWAYS AS IDENTITYで定義
	 */
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

	/**
	 * ファイル名
	 */
	filename: text("filename").notNull(),

	/**
	 * 画像バイナリデータ
	 * PostgreSQLのbytea型として保存される
	 */
	imageData: bytea("image_data").notNull(),

	/**
	 * 作成日時
	 */
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),

	/**
	 * 更新日時
	 */
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});
