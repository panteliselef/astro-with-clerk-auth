import React, { createElement } from "react";
import { withClerk, type WithClerkProp } from "./utils";
import type { SignInProps } from "@clerk/types";

export interface MountProps {
  mount?: (node: HTMLDivElement, props: any) => void;
  unmount?: (node: HTMLDivElement) => void;
  updateProps?: (props: any) => void;
  props?: any;
  customPagesPortals?: any[];
}

class Portal extends React.PureComponent<MountProps> {
  private portalRef = React.createRef<HTMLDivElement>();

  componentDidUpdate(prevProps: Readonly<MountProps>) {
    if (
      prevProps.props.appearance !== this.props.props.appearance ||
      prevProps.props?.customPages?.length !==
        this.props.props?.customPages?.length
    ) {
      this.props.updateProps?.({
        node: this.portalRef.current,
        props: this.props.props,
      });
    }
  }

  componentDidMount() {
    if (this.portalRef.current) {
      console.log("mounting", this.props.mount);
      this.props.mount?.(this.portalRef.current, this.props.props);
    }
  }

  componentWillUnmount() {
    if (this.portalRef.current) {
      this.props.unmount?.(this.portalRef.current);
    }
  }

  render() {
    return (
      <>
        <div ref={this.portalRef} />
        {this.props?.customPagesPortals?.map((portal, index) =>
          createElement(portal, { key: index }),
        )}
      </>
    );
  }
}

export const SignIn = withClerk(
  ({ clerk, ...props }: WithClerkProp<SignInProps>) => {
    return (
      <Portal
        mount={clerk?.mountSignIn}
        unmount={clerk?.unmountSignIn}
        updateProps={(clerk as any)?.__unstable__updateProps}
        props={props}
      />
    );
  },
  "SignIn",
);
