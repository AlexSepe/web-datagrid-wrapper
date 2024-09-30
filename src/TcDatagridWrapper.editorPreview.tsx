import { Component, ReactNode, createElement } from "react";
import { TcDatagridWrapperContainerProps } from "../typings/TcDatagridWrapperProps";


export class preview extends Component<TcDatagridWrapperContainerProps> {
    render(): ReactNode {
        return <div>{this.props.datagrid2Content}</div>;
    }
}

export function getPreviewCss(): string {
    return require("./ui/TcDatagridWrapper.css");
}
