declare module '@hello-pangea/dnd' {
  import * as React from 'react'

  export type DroppableId = string | number
  export type DraggableId = string | number
  export type DragStart = DragUpdate & {
    type: 'DRAG_START'
  }
  export type DragUpdate = {
    draggableId: DraggableId
    type: string
    source: DraggableLocation
    destination?: DraggableLocation | null
  }
  export type DropResult = {
    draggableId: DraggableId
    type: string
    source: DraggableLocation
    destination: DraggableLocation | null
    reason: 'DROP' | 'CANCEL'
  }
  export type DraggableLocation = {
    droppableId: DroppableId
    index: number
  }

  export type DraggableProps = {
    draggableId: DraggableId
    index: number
    isDragDisabled?: boolean
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactNode
  }

  export type DroppableProps = {
    droppableId: DroppableId
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactNode
    type?: string
    direction?: 'vertical' | 'horizontal'
  }

  export type DraggableProvided = {
    innerRef: (element: HTMLElement | null) => void
    draggableProps: {
      'data-rbd-draggable-context-id': string
      'data-rbd-draggable-id': string
      style?: React.CSSProperties
    }
    dragHandleProps: {
      'data-rbd-drag-handle-draggable-id': string
      'data-rbd-drag-handle-context-id': string
      'aria-describedby': string
      role: string
      tabIndex: number
      draggable: boolean
      onDragStart: (event: React.DragEvent<HTMLElement>) => void
    } | null
  }

  export type DroppableProvided = {
    innerRef: (element: HTMLElement | null) => void
    droppableProps: {
      'data-rbd-droppable-context-id': string
      'data-rbd-droppable-id': string
    }
    placeholder?: React.ReactNode
  }

  export type DraggableStateSnapshot = {
    isDragging: boolean
    isDropAnimating: boolean
    draggingOver: DroppableId | null
    dropAnimation: {
      curve: string
      duration: number
      moveTo: {
        x: number
        y: number
      }
    } | null
  }

  export type DroppableStateSnapshot = {
    isDraggingOver: boolean
    draggingOverWith: DraggableId | null
    draggingFromThisWith: DraggableId | null
    isUsingPlaceholder: boolean
  }

  export type DragDropContextProps = {
    onDragStart?: (initial: DragStart) => void
    onDragUpdate?: (initial: DragUpdate) => void
    onDragEnd: (result: DropResult) => void
    children: React.ReactNode
  }

  export const DragDropContext: React.ComponentType<DragDropContextProps>
  export const Droppable: React.ComponentType<DroppableProps>
  export const Draggable: React.ComponentType<DraggableProps>
}
