import React, { useState } from "react";

const createElement = (type) => ({
  id: Date.now() + Math.random(),
  type,
  content: "Edit me",
  children: []
});

export default function Builder() {
  const [tree, setTree] = useState([]);

  const addSection = () => {
    setTree([...tree, createElement("section")]);
  };

  const addText = (parentId) => {
    const update = (nodes) =>
      nodes.map((n) => {
        if (n.id === parentId) {
          return {
            ...n,
            children: [...n.children, createElement("text")]
          };
        }
        return { ...n, children: update(n.children || []) };
      });

    setTree(update(tree));
  };

  const renderElement = (el) => {
    if (el.type === "section") {
      return (
        <div key={el.id} style={{ border: "1px dashed gray", padding: 20 }}>
          <button onClick={() => addText(el.id)}>+ Text</button>
          {el.children.map(renderElement)}
        </div>
      );
    }

    if (el.type === "text") {
      return (
        <div
          key={el.id}
          contentEditable
          suppressContentEditableWarning
          style={{ padding: 10 }}
        >
          {el.content}
        </div>
      );
    }
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      
      <div style={{ width: 200, borderRight: "1px solid #ccc", padding: 10 }}>
        <button onClick={addSection}>Add Section</button>
      </div>

      <div style={{ flex: 1, padding: 20 }}>
        {tree.map(renderElement)}
      </div>

    </div>
  );
}