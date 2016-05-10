# friedjuju components

The most important parts are:

* routing
* components
* state management store

# Routing

The routing handled with html5 push state provides the following:

* Subscribe for changed route
* Attach state to current route


# Components

A component is specific to a given route.
The components are "complete applications" in the sense that they have:

1. UI template
2. Logic
3. Route subscription: they can specify the route on which they are activated
4. Events
5. Actions

## Events

onActivated: Invoked when the route changes to the activation route
onDeactivated: Invoked when the route changes to a non-activation route
onStoreNotification: Invoked when data in the store changes that the component has subscribed for
onRendered: Invoked when the component has rendered

## Methods

render(data): Renders the component


# State Management Store

The state management store is specific to a given route.

## Methods

setState(path, state): Sets state in the store
getState(path): Gets state in the store
subscribe: Subscribes for state change notification at a specific path in the store

When state changes then the matching subscribers have their onStoreNotification event handler invoked.
