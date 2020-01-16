import React, { useCallback, useRef, useState, useEffect } from 'react'
import setSelectionToBlock from '../../utils/setSelectionToBlock'
import './styles.css'

const Focus = WrappedComponent => props => {
  const { blockProps, block } = props
  const { getEditor } = blockProps
  const { editorState, hooks } = getEditor()
  const isMounted = useRef(false)
  const [focused, setFocus] = useState(false)
  const focusedRef = useRef(false)
  const currentBlockKey = block.getKey()
  timeoutHandler = useRef()

  useEffect(() => {
    isMounted.current = true
    return () => isMounted.current = false
  }, [])

  const setState = useCallback(falsy => {
    setFocus(falsy)
    focusedRef.current = falsy
  }, [])

  const delaySetState = useCallback(falsy => {
    clearTimeout(timeoutHandler.current)
    timeoutHandler.current = setTimeout(() => setState(falsy), 50)
  })

  useEffect(() => {
    hooks.selectionCollapsedChange.tap('Focus', (editorState, payload) => {
      const { newValue: { isCollapsed, selection } } = payload
      const startKey = selection.getStartKey()
      if (isCollapsed && startKey === currentBlockKey && !focusedRef.current) {
        delaySetState(true)
        return
      }
      if (!isCollapsed && focusedRef.current) {
        delaySetState(false)
        return
      }
    })

    hooks.selectionMoveOuterBlock.tap('Focus', (editorState, payload) => {
      const { newValue: { selection } } = payload
      const startKey = selection.getStartKey()
      if (startKey === currentBlockKey && !focusedRef.current) {
        delaySetState(true)
        return
      }
      if (startKey !== currentBlockKey && focusedRef.current) {
        delaySetState(false)
        return
      }
    })

    // hooks.onBlockSelectionChange.tap('Focus', (editorState, payload) => {
    //   payloadRef.current = payload

    //   // TODO：之所以这里面通过setTimeout的方式来触发，是因为在用户
    //   setTimeout(() => {
    //     if (!isMounted.current) return

    //     const { type, newValue } = payloadRef.current

    //     if (type === 'isCollapsed-change') {
    //       if (newValue.isCollapsed && newValue.startKey === currentBlockKey && !focusedRef.current) {
    //         setState(true)
    //         return
    //       }
    //       if (!newValue.isCollapsed && focusedRef.current) {
    //         setState(false)
    //         return
    //       }
    //       return
    //     }

    //     if (type === 'start-key-change') {
    //       if (newValue.startKey === currentBlockKey) {
    //         if (newValue.hasFocus && !focusedRef.current) {
    //           setState(true)
    //           return
    //         }
    //         if (!newValue.hasFocus && focusedRef.current) {
    //           setState(false)
    //           return
    //         }
    //       }
    //       if (newValue.startKey !== currentBlockKey && focusedRef.current) {
    //         setState(false)
    //         return
    //       }
    //     }
    //   }, 50)
    // })
  }, [])

  // 对于`Focusable` component, 当被点击的时候，`EditorState`的selection应该指向当前的
  // block
  const handleClick = useCallback(() => {
    // 如果已经被选中，再次点击不再触发handler
    const newEditorState = setSelectionToBlock(editorState, block)
    hooks.setState.call(newEditorState)
  }, [block, editorState])

  const className = focused ? 'focused_atomic_active' : 'focused_atomic'

  return (
    <div onClick={handleClick} className={className}>
      <WrappedComponent {...props} />
    </div>
  )
}

export default Focus