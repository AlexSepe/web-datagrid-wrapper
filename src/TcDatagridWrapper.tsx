import { Component, ReactNode, Fragment, createElement, Children } from "react";

import { TcDatagridWrapperContainerProps } from "../typings/TcDatagridWrapperProps";

import "./ui/TcDatagridWrapper.css";
import Big from "big.js";

export class TcDatagridWrapper extends Component<TcDatagridWrapperContainerProps> {
    gridName: string | null | undefined;
    gridKey: string | null | undefined;    
    lockupdates = false;

    constructor(props: TcDatagridWrapperContainerProps) {
        super(props);
        this.handleGridSourceChange = this.handleGridSourceChange.bind(this);
        this.setNewPageAndLimit = this.setNewPageAndLimit.bind(this);
    }

    getController(): any {
        const REGISTRY_NAME: any = "com.mendix.widgets.web.datagrid.export";
        const registry: any = window[REGISTRY_NAME];
        return registry?.get(this.gridName);
    }
        
    componentDidUpdate(_prevProps: Readonly<TcDatagridWrapperContainerProps>): void {
        if (!this.getController()) {
            console.debug(`[TcDatagridWrapper.${this.props.name}]`, "Controller not bound");
            this.bindController();
            return;
        }

        console.debug(`[TcDatagridWrapper.${this.props.name}]`, " DidUpdate:" + this.gridName);

        if (this.lockupdates) {
            return;
        }
        if (_prevProps.limit?.value !== this.props.limit?.value || _prevProps.page?.value !== this.props.page?.value) {
            console.debug(`New limit: ${this.props.limit?.value} New Page: ${this.props.page?.value}`);
            this.setNewPageAndLimit();
        }
    }

    componentDidMount(): void {
        this.bindController();
    }

    componentWillUnmount(): void {
        console.info("componentWillUnmount............");
    }

    bindController(): void {
        const controller = this.getController();  
        if (!controller) {
            console.error(
                `Controller Datagrid2 com nome ${this.gridName} não encontrado, revise a versão do DataWidgets.`
            );
            return;
        }

        console.info(
            `[TcDatagridWrapper.${this.props.name}]`,
            " bindController:",
            this.gridName,
            " controller:",
            controller
        );

        this.setNewPageAndLimit();

        if (!controller.emitter.events.sourcechange.includes(this.handleGridSourceChange)) {
            controller.emitter.events.sourcechange.push(this.handleGridSourceChange);
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
        
        this.props.offset?.setValue(new Big(offset));
        this.props.page?.setValue(new Big(offset / limit + 1));
        this.props.pageCount?.setValue(new Big(pageCount));
        this.props.totalCount?.setValue(new Big(totalCount));
        //copy limit value to props only if not defined there..
        if (!this.props.limit?.value || this.props.limit?.value.toNumber() <= 0 ){
            this.props.limit?.setValue(new Big(limit));
        }        

        if (this.props.ondatachanged && this.props.ondatachanged.canExecute) {
            this.props.ondatachanged.execute();
        }
        this.lockupdates = false;

        //FIX grid visibility Hides etc..
        //grid limit not set propertly
        if (this.props.limit?.value && this.props.limit?.value.toNumber() != limit){
            this.setNewPageAndLimit();
        }
    }

    setNewPageAndLimit(): void {
        const controller = this.getController(); 
        if (!controller) {
            console.error(
                `Controller Datagrid2 com nome ${this.gridName} não encontrado, revise a versão do DataWidgets.`
            );
            return;
        }

        const limit = this.props.limit?.value?.toNumber();
        const page = this.props.page?.value?.toNumber();
        if (limit !== undefined && page !== undefined && limit > 0 && page > 0) {
            const offset = (page - 1) * limit;
            controller?.datasource?.setLimit(limit);
            controller?.datasource?.setOffset(offset);
        }
    }

    render(): ReactNode {
        const searchGridWidget = (child: any) => {
            // child.type.displayName === "pluginWidget(ConditionalVisibilityWrapper)"
            if (child.props?.contents){
                searchGridWidget(child.props?.contents[0]);
                return;
            }
            // child.type.displayName === "pluginWidget(Container)"
            if (child.props?.content){
                searchGridWidget(child.props?.content[0]);
                return;
            }
            
            // Is a Datagrid??? who knows...
            this.gridName = child.key?.split(".").pop();
            this.gridKey = child.key;
        }
        
        const wrapGrid = (content: any): ReactNode => {
            Children.forEach(content, (child, _index) => {
                searchGridWidget(child);                                
            });
            return content;
        };

        return <Fragment>{wrapGrid(this.props.datagrid2Content)}</Fragment>;
    }
}
