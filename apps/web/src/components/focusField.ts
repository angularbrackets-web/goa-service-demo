/**
 * Move focus to a form field from an error summary link.
 *
 * The GoA web components render their native <input>/<textarea> inside shadow
 * DOM, so a plain "#id" link would only scroll to the wrapper. We find the
 * form item by id (each GoabFormItem gets the field name as its id) and focus
 * the first native control inside it, walking into shadow roots as needed.
 */
export function focusField(id: string) {
  const formItem = document.getElementById(id);
  if (!formItem) return;
  formItem.scrollIntoView({ block: 'center' });
  (findFocusable(formItem) ?? formItem).focus();
}

const FOCUSABLE = 'input:not([type="hidden"]), textarea, select';

function findFocusable(root: Element | ShadowRoot): HTMLElement | null {
  for (const element of Array.from(root.querySelectorAll('*'))) {
    if (element.matches(FOCUSABLE)) return element as HTMLElement;
    if (element.shadowRoot) {
      const inner = findFocusable(element.shadowRoot);
      if (inner) return inner;
    }
  }
  return null;
}
