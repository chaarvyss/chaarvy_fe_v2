export const formatHtmlVariables = (html: string) => {
  const temp = document.createElement('div')
  temp.innerHTML = html

  const walk = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT, null)
  let node
  const textNodes: Node[] = []
  while ((node = walk.nextNode())) {
    textNodes.push(node)
  }

  textNodes.forEach(textNode => {
    const text = textNode.nodeValue || ''
    const regex = /\{\{(.*?)\}\}/g

    if (regex.test(text)) {
      const spanWrap = document.createElement('span')
      spanWrap.innerHTML = text.replace(regex, match => {
        const uniqueId = `span_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

        return `<span id="${uniqueId}" data-dynamic="true" style="color: #e91e63; font-weight: bold; cursor: pointer; padding: 0 2px;">${match}</span>`
      })
      textNode.parentNode?.replaceChild(spanWrap, textNode)
    }
  })

  return temp.innerHTML
}
