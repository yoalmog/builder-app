import React, { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter
} from "@dnd-kit/core";

// ---------- ELEMENT FACTORY ----------
const createElement = (type) => ({
  id: Date.now() + Math.random(),
  type,
  content: type === "button" ? "Click me" : "Edit me",
  src: "https://via.placeholder.com/150",
  style: {
    padding: 10,
    background: "#fff",
    color: "#000"
  },
  children: []
});

// ---------- DRAG ----------
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

// ---------- DROP ----------
function DropZone({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 80,
        borderTop: isOver ? "3px solid blue" : "none",
        borderBottom: isOver ? "3px solid blue" : "none"
      }}
    >
      {children}
    </div>
  );
}

export default function Builder() {
  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(null);

  // ---------- ADD ----------
  const addSection = () => {
    setTree([...tree, createElement("section")]);
  };

  const addColumns = (sectionId, count) => {
    const update = (nodes) =>
      nodes.map((n) => {
        if (n.id === sectionId) {
          return {
            ...n,
            children: Array.from({ length: count }).map(() => ({
              ...createElement("column"),
              width: 100 / count
            }))
          };
        }
        return { ...n, children: update(n.children || []) };
      });

    setTree(update(tree));
  };

  const addElement = (columnId, type) => {
    const update = (nodes) =>
      nodes.map((n) => {
        if (n.id === columnId) {
          return {
            ...n,
            children: [...n.children, createElement(type)]
          };
        }
        return { ...n, children: update(n.children || []) };
      });

    setTree(update(tree));
  };

  // ---------- DRAG ----------
  const handleDragEnd = ({ active, over }) => {
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

  // ---------- STYLE PANEL ----------
  const updateStyle = (key, value) => {
    const update = (nodes) =>
      nodes.map((n) => {
        if (n.id === selected?.id) {
          return {
            ...n,
            style: { ...n.style, [key]: value }
          };
        }
        return { ...n, children: update(n.children || []) };
      });

    setTree(update(tree));
  };

  // ---------- RENDER ----------
  const renderElement = (el) => {
    if (el.type === "section") {
      return (
        <div key={el.id} style={{ border: "2px solid #aaa", marginBottom: 20 }}>
          <div style={{ padding: 10 }}>
            <button onClick={() => addColumns(el.id, 2)}>2 Col</button>
            <button onClick={() => addColumns(el.id, 3)}>3 Col</button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {el.children.map((col) => (
              <DropZone key={col.id} id={col.id}>
                <div
                  style={{
                    flex: col.width,
                    border: "1px dashed gray",
                    padding: 10
                  }}
                >
                  <button onClick={() => addElement(col.id, "text")}>
                    Text
                  </button>
                  <button onClick={() => addElement(col.id, "image")}>
                    Image
                  </button>
                  <button onClick={() => addElement(col.id, "button")}>
                    Button
                  </button>

                  {col.children.map((child) => (
                    <Draggable key={child.id} id={child.id}>
                      <div onClick={() => setSelected(child)}>
                        {renderElement(child)}
                      </div>
                    </Draggable>
                  ))}
                </div>
              </DropZone>
            ))}
          </div>
        </div>
      );
    }

    if (el.type === "text") {
      return (
        <div contentEditable style={el.style}>
          {el.content}
        </div>
      );
    }

    if (el.type === "image") {
      return <img src={el.src} style={{ width: "100%" }} />;
    }

    if (el.type === "button") {
      return <button style={el.style}>{el.content}</button>;
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", height: "100%" }}>
        
        {/* LEFT */}
        <div style={{ width: 200, borderRight: "1px solid #ccc" }}>
          <button onClick={addSection}>Add Section</button>
        </div>

        {/* CANVAS */}
        <div style={{ flex: 1, padding: 20 }}>
          {tree.map(renderElement)}
        </div>

        {/* RIGHT STYLE PANEL */}
        <div style={{ width: 250, borderLeft: "1px solid #ccc", padding: 10 }}>
          <h4>Style</h4>
          <input
            placeholder="Padding"
            onChange={(e) => updateStyle("padding", e.target.value)}
          />
          <input
            placeholder="Background"
            onChange={(e) => updateStyle("background", e.target.value)}
          />
          <input
            placeholder="Color"
            onChange={(e) => updateStyle("color", e.target.value)}
          />
        </div>

      </div>
    </DndContext>
  );
}
