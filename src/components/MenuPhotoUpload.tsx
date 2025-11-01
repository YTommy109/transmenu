/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { useCallback, useEffect, useState } from 'react';

type MenuPhoto = {
  id: number;
  filename: string;
  createdAt: string;
};

export function MenuPhotoUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<MenuPhoto[]>([]);

  // 画像一覧を取得
  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch('/api/menu-photos');
      if (!response.ok) throw new Error('画像一覧の取得に失敗しました');
      const data = await response.json();
      setPhotos(data);
    } catch (_err) {
      // Error handling: silently fail for now
      // In production, you might want to show an error message to the user
    }
  }, []);

  // コンポーネントマウント時に画像一覧を取得
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);

    // プレビュー用のURLを生成
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('ファイルを選択してください');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/menu-photos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      // アップロード成功後、プレビューをクリア
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);

      // 画像一覧を再取得
      await fetchPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div css={containerStyle}>
      <div css={uploadSectionStyle}>
        <h2 css={titleStyle}>メニュー写真をアップロード</h2>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          css={fileInputStyle}
          disabled={uploading}
        />

        {previewUrl && (
          <div css={previewContainerStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="プレビュー" css={previewImageStyle} />
          </div>
        )}

        {error && <div css={errorStyle}>{error}</div>}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          css={uploadButtonStyle}
        >
          {uploading ? 'アップロード中...' : 'アップロード'}
        </button>
      </div>

      <div css={photoListSectionStyle}>
        <h2 css={titleStyle}>保存済み画像</h2>
        {photos.length === 0 ? (
          <p css={emptyMessageStyle}>まだ画像がアップロードされていません</p>
        ) : (
          <div css={photoGridStyle}>
            {photos.map((photo) => (
              <div key={photo.id} css={photoItemStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/menu-photos/${photo.id}`}
                  alt={photo.filename}
                  css={thumbnailStyle}
                />
                <p css={filenameStyle}>{photo.filename}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const containerStyle = css`
	max-width: 800px;
	margin: 0 auto;
	padding: 20px;
`;

const uploadSectionStyle = css`
	margin-bottom: 40px;
	padding: 20px;
	border: 1px solid #ddd;
	border-radius: 8px;
	background-color: #f9f9f9;
`;

const titleStyle = css`
	font-size: 1.5rem;
	font-weight: bold;
	margin-bottom: 16px;
`;

const fileInputStyle = css`
	display: block;
	margin-bottom: 16px;
	padding: 8px;
	width: 100%;
`;

const previewContainerStyle = css`
	margin-bottom: 16px;
`;

const previewImageStyle = css`
	max-width: 100%;
	max-height: 300px;
	border-radius: 4px;
	border: 1px solid #ddd;
`;

const errorStyle = css`
	color: #d32f2f;
	margin-bottom: 16px;
	padding: 8px;
	background-color: #ffebee;
	border-radius: 4px;
`;

const uploadButtonStyle = css`
	padding: 10px 20px;
	background-color: #1976d2;
	color: white;
	border: none;
	border-radius: 4px;
	font-size: 1rem;
	cursor: pointer;

	&:hover:not(:disabled) {
		background-color: #1565c0;
	}

	&:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}
`;

const photoListSectionStyle = css`
	padding: 20px;
	border: 1px solid #ddd;
	border-radius: 8px;
`;

const emptyMessageStyle = css`
	color: #666;
	text-align: center;
	padding: 20px;
`;

const photoGridStyle = css`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 16px;
`;

const photoItemStyle = css`
	border: 1px solid #ddd;
	border-radius: 4px;
	padding: 8px;
	background-color: white;
`;

const thumbnailStyle = css`
	width: 100%;
	height: 150px;
	object-fit: cover;
	border-radius: 4px;
	margin-bottom: 8px;
`;

const filenameStyle = css`
	font-size: 0.875rem;
	color: #666;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;
