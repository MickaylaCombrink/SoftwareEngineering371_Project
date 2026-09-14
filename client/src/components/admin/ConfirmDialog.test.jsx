import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

function setup(overrides = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  render(
    <ConfirmDialog
      open
      title="Delete this product?"
      body="This cannot be undone."
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />
  );

  return { onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  test('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog open={false} title="x" body="y" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('a destructive action is never taken without confirmation', async () => {
    const { onConfirm, onCancel } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('confirming calls back exactly once', async () => {
    const { onConfirm } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('escape cancels', async () => {
    const { onCancel, onConfirm } = setup();

    await userEvent.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('escape is ignored while the action is in flight', async () => {
    const { onCancel } = setup({ busy: true });

    await userEvent.keyboard('{Escape}');

    expect(onCancel).not.toHaveBeenCalled();
  });

  test('both buttons are disabled while busy, so it cannot be double-submitted', () => {
    setup({ busy: true });

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Working…' })).toBeDisabled();
  });

  test('it is announced as a modal dialog', () => {
    setup();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-title');
  });

  test('focus lands on the confirm button when it opens', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
  });
});
