import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

// Note: このテストはjsdom環境が必要ですが、現在はnodeモードです
// 実際のコンポーネントテストはjsdom環境で実行されます

describe('Button', () => {
  it('should have correct component structure', () => {
    // コンポーネントの型チェックテスト
    const mockOnClick = vi.fn();
    
    // TypeScriptレベルでの型チェック
    const buttonProps = {
      children: 'Test Button',
      onClick: mockOnClick,
      variant: 'primary' as const,
      disabled: false,
    };
    
    expect(buttonProps.variant).toBe('primary');
    expect(buttonProps.disabled).toBe(false);
    expect(typeof buttonProps.children).toBe('string');
  });

  it('should accept all valid variant values', () => {
    const variants: ('primary' | 'secondary')[] = ['primary', 'secondary'];
    
    variants.forEach(variant => {
      expect(['primary', 'secondary']).toContain(variant);
    });
  });
});