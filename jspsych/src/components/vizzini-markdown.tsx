//@ts-ignore
import React from "react"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// const probableSpan = (word) => {return `<span class="probable">${word}</span>`}
//
// const transformP = ({node, ...props}) => {
//   console.log(node, props)
//   const probableRE   = /probable/gi
//   const improbableRE = /improbable/gi
//   const impossibleRE = /impossible/gi
//   const typeErrorRE  = /type error/gi
//
//   props.children = props.children.map((child) => {
//     let replace;
//     replace = child.replaceAll(probableRE, probableSpan)
//     return replace
//   })
//   console.log(props.children)
//
//   return <p {...props}/>
// }
//
// const components = {
//   p: transformP,
// }

const VizziniMarkdown = ({children, ...rest}) => {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} {...rest}>
    {children}
  </ReactMarkdown>
}

export default VizziniMarkdown
