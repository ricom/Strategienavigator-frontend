import React, {Component, ReactNode} from "react";
import {Button, ButtonProps} from "react-bootstrap";
import {faSave} from "@fortawesome/free-solid-svg-icons";
import {Loader, LoaderVariants} from "../Loader/Loader";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import FAE from "../Icons/FAE";


export interface LoadingButtonProps extends ButtonProps {
    /**
     * Whether the loading animation should be played
     */
    isLoading: boolean
    /**
     * What is inside the button while saving
     */
    savingChild: ReactNode
    /**
     * What is inside the button
     */
    defaultChild: ReactNode
    /**
     * Whether to show the icons in front of the specified childs
     */
    showIcons: boolean
    /**
     * Icon which is schon while not saving
     */
    defaultIcon: IconDefinition
    /**
     * The style of the Loader
     */
    loaderVariant?: LoaderVariants
}

export class LoadingButton extends Component<LoadingButtonProps, {}> {

    static defaultProps = {
        showIcons: true,
        defaultIcon: faSave
    }

    render() {
        let {
            isLoading,
            savingChild,
            defaultChild,
            variant,
            loaderVariant,
            showIcons,
            defaultIcon,
            ...props
        } = this.props;

        if (!variant)
            variant = "primary";

        if (!loaderVariant) {
            switch (variant) {
                case "dark":
                    loaderVariant = "light";
                    break;
                case "primary":
                    loaderVariant = "light";
                    break;
                case "light":
                    loaderVariant = "dark";
                    break;
                default:
                    break;
            }
        }

        return (
            <Button
                {...props}
                disabled={isLoading}
                variant={variant}
            >
                {!isLoading ? (
                    <>{showIcons && (<FAE icon={defaultIcon}/>)} {defaultChild}</>
                ) : (

                    showIcons ? (
                            <Loader variant={loaderVariant ?? "light"}
                                    text={<span>&nbsp;{savingChild}</span>}
                                    transparent size={20} loaded={false}/>)
                        : savingChild

                )}
            </Button>
        );
    }
}
