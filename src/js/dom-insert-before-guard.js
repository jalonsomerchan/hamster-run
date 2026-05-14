const nativeInsertBefore = Node.prototype.insertBefore;

Node.prototype.insertBefore = function insertBeforeWithNestedReference(newNode, referenceNode) {
  if (referenceNode && referenceNode.parentNode !== this && referenceNode.parentNode) {
    return nativeInsertBefore.call(referenceNode.parentNode, newNode, referenceNode);
  }

  return nativeInsertBefore.call(this, newNode, referenceNode);
};
