import { Component, ReactNode, Fragment, createElement } from "react";

import { TcDatagridWrapperContainerProps } from "../typings/TcDatagridWrapperProps";

import "./ui/TcDatagridWrapper.css";
import React from "react";
import Big from "big.js";

export class TcDatagridWrapper extends Component<TcDatagridWrapperContainerProps> {
    gridName: string | null | undefined;
    gridKey: string | null | undefined;
    controller: any;
    private _gridRef: any;
    lockupdates: boolean = false;

    constructor(props: TcDatagridWrapperContainerProps) {
        super(props);
        this.handleGridSourceChange = this.handleGridSourceChange.bind(this);
        this.setNewPageAndLimit = this.setNewPageAndLimit.bind(this);
    }

    componentDidUpdate(_prevProps: Readonly<TcDatagridWrapperContainerProps>, _prevState: Readonly<{}>): void {
        console.debug("DidUpdate:", this.gridName);

        if (this.lockupdates){
            return;
        }
        if (_prevProps.limit?.value != this.props.limit?.value || _prevProps.page?.value != this.props.page?.value) {
            console.debug("New limit:", this.props.limit);
            console.debug("New Page:", this.props.page);
            this.setNewPageAndLimit();
        }
    }

    componentDidMount(): void {
        const REGISTRY_NAME: any = "com.mendix.widgets.web.datagrid.export";
        const registry: any = window[REGISTRY_NAME];
        this.controller = registry.get(this.gridName);

        console.info("DidMount:", this.gridName, " controller:", this.controller);

        if (this.controller === undefined) {
            console.error(
                `Controller Datagrid2 com nome ${this.gridName} não encontrado, revise a versão do DataWidgets.`
            );
            return;
        }

        if (!this.controller.emitter.events.sourcechange.includes(this.handleGridSourceChange)) {
            this.controller.emitter.events.sourcechange.push(this.handleGridSourceChange);
        }
    }

    handleGridSourceChange(gridDatasource: any): void {
        if (gridDatasource.status !== "available") {
            return;
        }
        console.debug(
            "handleGridSourceChange -> limit: " +
                gridDatasource.limit +
                " offset:" +
                gridDatasource.offset +
                " totalCount:" +
                gridDatasource.totalCount
        );
        const offset: number = gridDatasource.offset;
        const limit: number = gridDatasource.limit;
        const pageCount: number = gridDatasource.items.length;
        const totalCount: number = gridDatasource.totalCount;
        
        this.lockupdates = true;

        this.props.limit?.setValue(new Big(limit));
        this.props.offset?.setValue(new Big(offset));
        this.props.page?.setValue(new Big(offset / limit + 1));
        this.props.pageCount?.setValue(new Big(pageCount));
        this.props.totalCount?.setValue(new Big(totalCount));

        if (this.props.ondatachanged && this.props.ondatachanged.canExecute) {
            this.props.ondatachanged.execute();
        }

        this.lockupdates = false;
    }

    setNewPageAndLimit() {
        if (this.controller === undefined) {
            console.error(
                `Controller Datagrid2 com nome ${this.gridName} não encontrado, revise a versão do DataWidgets.`
            );
            return;
        }
        
        const limit = this.props.limit?.value?.toNumber();
        const page = this.props.page?.value?.toNumber();
        if (limit != undefined && page != undefined && limit > 0 && page > 0) {
            const offset = (page - 1) * limit;
            this.controller.datasource.setLimit(limit);
            this.controller.datasource.setOffset(offset);
        }
    }

    render(): ReactNode {
        const wrapGrid = (content: any): ReactNode => {            
            this._gridRef = React.createRef();

            const childrenWithProps = React.Children.map(content, (child, _index) => {
                const cloned = React.cloneElement(child, { ref: this._gridRef });
                this.gridName = cloned.key?.split(".").pop();
                this.gridKey = cloned.key;
                return cloned;
            });

            return childrenWithProps;
        };

        return <Fragment>{wrapGrid(this.props.datagrid2Content)}</Fragment>;
    }
}