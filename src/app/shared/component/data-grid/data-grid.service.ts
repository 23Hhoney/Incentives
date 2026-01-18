export interface DataGridColumnHeader {
  show?:boolean;
  columnName: string;
  columnTitle?: string;
  sort?:boolean;
  type?: string;
  buttonArray?: boolean;
  button?: Button;
  buttons?: Button[];
  checkboxParameter?: string;
  headerClass?: string;
  textColor?: string;
}

export interface DataGridColumnHeader {
  show?:boolean;
  columnName: string;
  columnTitle?: string;
  columnTitleKey?: string;
  columnValue?: string;
  sort?:boolean;
  showIconParameter?: string;
  icon?: string;
}

export class Link {
  linkClass?: string;
  linkName?: string;
  icon?: string;
  isIconSvg?: boolean;
  color?: string;
}

export class Button {
  buttonType?: string;
  buttonName?: string;
  icon?: string;
  isIconSvg?: boolean;
  colorParameter?: string;
  buttonAction?: string;
  disableBtnParam?: string;
  buttonClass?: string;
  tooltipKey?: string;
  hideButton?:boolean;
}

export const COLUMN_TYPE = {
  TEXT: 'text',
  TEXT_W_ELLIP: 'text-ellip',
  TEXT_W_ELLIP_L: 'text-ellip-l',
  COMMANUMBER: 'comma-separated',
  EMAIL: 'email-ellip',
  DATE: 'date',
  Status: 'status',
  BUTTON: 'button',
  POPOVER: 'popover-button',
  LINK: 'link',
  CHECKBOX: 'checkbox',
  DOC: 'doc',
  TEXTWITHBACKGROUD: 'textbackground',
  TEXT_W_BOLD:'text-bold',
  TEXTWITHBACKGROUNDBUTTON:'textwithbackgroundbutton'
};