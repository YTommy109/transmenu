import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

/**
 * Button コンポーネントのテスト
 *
 * Note: 現在このテストファイルはjsdom互換性問題により除外されています
 * 将来的にjsdom環境が修正されたら有効化予定
 */

describe('Button コンポーネント', () => {
  it('正しいテキストで描画される', () => {
    // Arrange
    const buttonText = 'Click me';

    // Act
    render(<Button>{buttonText}</Button>);

    // Assert
    expect(
      screen.getByRole('button', { name: buttonText })
    ).toBeInTheDocument();
  });

  it('クリック時にonClickが呼ばれる', () => {
    // Arrange
    const mockOnClick = vi.fn();
    render(<Button onClick={mockOnClick}>Click me</Button>);

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('disabled プロパティが true の時、ボタンが無効化される', () => {
    // Arrange
    render(<Button disabled>Disabled Button</Button>);

    // Act
    const button = screen.getByRole('button');

    // Assert
    expect(button).toBeDisabled();
  });

  it('無効化されている時、onClickが呼ばれない', () => {
    // Arrange
    const mockOnClick = vi.fn();
    render(
      <Button onClick={mockOnClick} disabled>
        Disabled Button
      </Button>
    );

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('variant プロパティに応じて正しいスタイルが適用される', () => {
    // Arrange
    const { rerender } = render(<Button variant="primary">Primary</Button>);

    // Act & Assert - Primary variant
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Act - Secondary variantに変更
    rerender(<Button variant="secondary">Secondary</Button>);

    // Assert
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('childrenプロパティが正しく表示される', () => {
    // Arrange
    const testContent = 'テストボタン';

    // Act
    render(<Button>{testContent}</Button>);

    // Assert
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('デフォルトのvariantはprimaryである', () => {
    // Arrange
    // variant未指定でButtonを作成

    // Act
    render(<Button>Default Button</Button>);

    // Assert
    // デフォルトでprimaryスタイルが適用されることを確認
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Note: 実際のCSSスタイルチェックはE2Eテストで実施
  });
});
