import React, { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter
} from "@dnd-kit/core";

// Create element
const createElement = (type) => ({
  id: Date.now() + Math.random(),
  type,
  content: "Edit me",
  children: []
});

// Draggable
function Draggable({ id, children }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        cursor: "grab"
      }}
    >
      {children}
    </div>
  );
}

// Drop zone
function DropZone({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 50,
        background: isOver ? "#e0f2ff" : "transparent"
      }}
    >
      {children}
    </div>
  );
}

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

  // Drag logic
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    let dragged;

    const remove = (nodes) =>
      nodes
        .map((n) => {
          if (n.id === active.id) {
            dragged = n;
            return null;
          }
          return { ...n, children: remove(n.children || []) };
        })
        .filter(Boolean);

    const insert = (nodes) =>
      nodes.map((n) => {
        if (n.id === over.id) {
          return {
            ...n,
            children: [...n.children, dragged]
          };
        }
        return { ...n, children: insert(n.children || []) };
      });

    setTree(insert(remove(tree)));
  };

  const renderElement = (el) => {
    if (el.type === "section") {
      return (
        <DropZone key={el.id} id={el.id}>
          <div style={{ border: "1px dashed gray", padding: 20 }}>
            <button onClick={() => addText(el.id)}>+ Text</button>

            {el.children.map((child) => (
              <Draggable key={child.id} id={child.id}>
                {renderElement(child)}
              </Draggable>
            ))}
          </div>
        </DropZone>
      );
    }

    if (el.type === "text") {
      return (
        <div
          key={el.id}
          contentEditable
          suppressContentEditableWarning
          style={{
            padding: 10,
            border: "1px solid #ddd",
            marginTop: 5
          }}
        >
          {el.content}
        </div>
      );
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", height: "100%" }}>
        
        {/* Sidebar */}
        <div style={{ width: 200, borderRight: "1px solid #ccc", padding: 10 }}>
          <button onClick={addSection}>Add Section</button>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, padding: 20 }}>
          {tree.map(renderElement)}
        </div>

      </div>
    </DndContext>
  );
}
