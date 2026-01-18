export interface SelectOption {
    id: number;
    value: string;
    checked?: boolean;
}

export interface SelectLabelOption {
    label: string;
    selected: boolean;
    options: SelectOption[];
}

export interface SelectReturn {
    type: string;
    data: SelectOption[];
}

export interface SelectedData {
    type: string;
    idList: number[];
}
