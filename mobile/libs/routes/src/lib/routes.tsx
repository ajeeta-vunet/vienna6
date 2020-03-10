import { RouteProps } from 'react-router-dom';
import { AuthState } from '@vu/store';

export type AppRoute =
| {
    routeProps: RouteProps;
    name: string;
    icon?: string;
    type: 'Route' | 'PrivateRoute';
  }
| {
    routeProps: RouteProps;
    name: string;
    icon?: string;
    type: 'AuthorizedRoute';
    authorizer: (a: AuthState) => boolean;
  }
| {
    component: JSX.Element;
    name: string;
    type: 'JSX';
  };
