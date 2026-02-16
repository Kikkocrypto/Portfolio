/**
 * TinyMCE configuration for blog content editing.
 * Minimal, safe toolbar; no scripts, iframes, or media embedding.
 * Valid elements whitelist; no external plugin loading.
 */

export const TINYMCE_SAFE_TOOLBAR =
  'bold italic underline | bullist numlist | link removeformat';

export const TINYMCE_SAFE_PLUGINS = 'lists link autolink';

/** Allowed HTML elements (whitelist). Script, iframe, object, embed are not allowed. */
export const TINYMCE_VALID_ELEMENTS =
  'p,br,strong,b,em,i,u,ul,ol,li,a[href|target|rel],h2,h3,h4';

export const TINYMCE_VALID_CHILD_ELEMENTS = 'body[p|br|strong|b|em|i|u|ul|ol|li|a|h2|h3|h4]';

export interface TinyMCEConfig {
  readonly height: number;
  readonly menubar: false;
  readonly plugins: string;
  readonly toolbar: string;
  readonly valid_elements: string;
  readonly valid_children: string;
  readonly content_style: string;
  readonly branding: false;
  readonly promotion: false;
  readonly paste_as_text: boolean;
  readonly paste_block_drop: boolean;
  readonly paste_remove_styles: boolean;
  readonly paste_remove_styles_if_webkit: boolean;
  readonly link_default_target: '_blank';
  readonly link_assume_external_targets: true;
  readonly default_link_target: '_blank';
  readonly rel_list: { title: string; value: string }[];
  readonly init_instance_callback?: (editor: { getContent: () => string }) => void;
}

export function getTinyMCEConfig(
  callback?: (editor: { getContent: () => string }) => void
): TinyMCEConfig {
  return {
    height: 280,
    menubar: false,
    plugins: TINYMCE_SAFE_PLUGINS,
    toolbar: TINYMCE_SAFE_TOOLBAR,
    valid_elements: TINYMCE_VALID_ELEMENTS,
    valid_children: TINYMCE_VALID_CHILD_ELEMENTS,
    content_style:
      'body { font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.5; color: #3d3832; }',
    branding: false,
    promotion: false,
    paste_as_text: false,
    paste_block_drop: false,
    paste_remove_styles: true,
    paste_remove_styles_if_webkit: true,
    link_default_target: '_blank',
    link_assume_external_targets: true,
    default_link_target: '_blank',
    rel_list: [
      { title: 'No follow', value: 'nofollow' },
      { title: 'No opener', value: 'noopener' },
      { title: 'No opener noreferrer', value: 'noopener noreferrer' },
    ],
    ...(callback ? { init_instance_callback: callback } : {}),
  };
}
