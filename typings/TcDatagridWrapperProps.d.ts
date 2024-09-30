/**
 * This file was generated from TcDatagridWrapper.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, EditableValue } from "mendix";
import { Big } from "big.js";

export interface TcDatagridWrapperContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    datagrid2Content: ReactNode;
    limit?: EditableValue<Big>;
    page?: EditableValue<Big>;
    offset?: EditableValue<Big>;
    pageCount?: EditableValue<Big>;
    totalCount?: EditableValue<Big>;
    ondatachanged?: ActionValue;
}

export interface TcDatagridWrapperPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    datagrid2Content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    limit: string;
    page: string;
    offset: string;
    pageCount: string;
    totalCount: string;
    ondatachanged: {} | null;
}
