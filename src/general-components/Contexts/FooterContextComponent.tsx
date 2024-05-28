import {ControlFooterItemType} from "../ControlFooter/ControlFooter";
import React, {Component, ReactNode, useContext} from "react";


export interface IFooterContext {
    items: Map<number, ControlFooterItemType>
}

export interface IFooterControllerContext {
    setItem: (place: number, item: ControlFooterItemType) => void,
    removeItem: (place: number) => void,
    disableItem: (place: number, disable: boolean) => void,
    clearItems: () => void
}

export interface FooterContextState {
    footerContext: IFooterContext;
    footerControllerContext: IFooterControllerContext;
}

export interface FooterContextProps {
    children: ReactNode
}

const DefaultContext: IFooterContext = {
    items: new Map()
};
const DefaultControllerContext: IFooterControllerContext = {
    setItem: () => {
        console.warn("Called set item of Footer Context without an existing context.")
    },
    removeItem: () => {
        console.warn("Called remove item of Footer Context without an existing context.")
    },
    clearItems: () => {
        console.warn("Called clear items of Footer Context without an existing context.")
    },
    disableItem: () => {
        console.warn("Called disable item of Footer Context without an existing context.")
    }
}

export const FooterContext = React.createContext<IFooterContext>(DefaultContext);
export const FooterControllerContext = React.createContext<IFooterControllerContext>(DefaultControllerContext);


export function useFooterContext() {
    return useContext(FooterContext);
}
export function useFooterControllerContext() {
    return useContext(FooterControllerContext);
}


export class FooterContextComponent extends Component<FooterContextProps, FooterContextState> {

    constructor(props: Readonly<FooterContextProps> | FooterContextProps);
    constructor(props: FooterContextProps, context: any);
    constructor(props: FooterContextProps | Readonly<FooterContextProps>, context?: any) {
        super(props, context);
        this.state = {
            footerContext: this.buildContext(new Map()),
            footerControllerContext: {
                setItem: this.setItem,
                removeItem: this.removeItem,
                disableItem: this.disableItem,
                clearItems: this.clear
            }
        };
    }

    render() {
        return (
            <FooterControllerContext.Provider value={this.state.footerControllerContext}>
                <FooterContext.Provider value={this.state.footerContext}>
                    {this.props.children}
                </FooterContext.Provider>
            </FooterControllerContext.Provider>
        );
    }

    private setItem = (place: number, item: ControlFooterItemType) => {
        this.setState(state => {
            const items = state.footerContext.items.set(place, item);

            return {
                footerContext: this.buildContext(items)
            }
        });
    }

    private disableItem = (place: number, disabled: boolean) => {
        if (this.state.footerContext.items.has(place)) {
            this.setState(state => {
                const items = state.footerContext.items;
                const item = items.get(place);
                if (item) {
                    item.disabled = disabled;
                }

                return {
                    footerContext: this.buildContext(items)
                }
            });
        }
    }

    private removeItem = () => {

    }

    private clear = () => {
        this.setState(state => {
            return {
                footerContext: this.buildContext(new Map<number, ControlFooterItemType>())
            }
        });
    }

    private buildContext(items: Map<number, ControlFooterItemType>): IFooterContext {
        return {
            items: items
        }
    }
}
