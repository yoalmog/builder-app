import React, { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter
} from "@dnd-kit/core";

import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// ---------- ELEMENT ----------
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
        borderTop: isOver ? "3px solid blue" : "none"
      }}
    >
      {children}
    </div>
  );
}

export default function Builder({ user }) {
  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(null);
  const [device, setDevice] = useState("desktop");
  const [pageId, setPageId] = useState("home");

  // ---------- SAVE ----------
  const savePage = async () => {
    if (!user) return;

    await setDoc(doc(db, "pages", user.uid + "_" + pageId), {
      tree
    });

    alert("Saved!");
  };

  // ---------- LOAD ----------
  const loadPage = async () => {
    if (!user) return;

    const snap = await getDoc(doc(db, "pages", user.uid + "_" + pageId));

    if (snap.exists()) {
      setTree(snap.data().tree);
    }
  };

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

  // ---------- RENDER ----------
  const renderElement = (el) => {
    if (el.type === "section") {
      return (
        <div key={el.id} style={{ border: "2px solid #aaa", marginBottom: 20 }}>
          
          <div style={{ padding: 10 }}>
            <button onClick={() => addColumns(el.id, 2)}>2 Col</button>
            <button onClick={() => addColumns(el.id, 3)}>3 Col</button>
          </div>

          <div style={{ display: "flex" }}>
            {el.children.map((col) => (
              <DropZone key={col.id} id={col.id}>
                <div style={{ flex: col.width, padding: 10 }}>
                  
                  <button onClick={() => addElement(col.id, "text")}>Text</button>
                  <button onClick={() => addElement(col.id, "image")}>Image</button>
                  <button onClick={() => addElement(col.id, "button")}>Button</button>

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
      return <div contentEditable>{el.content}</div>;
    }

    if (el.type === "image") {
      return <img src={el.src} style={{ width: "100%" }} />;
    }

    if (el.type === "button") {
      return <button>{el.content}</button>;
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", height: "100%" }}>

        {/* LEFT */}
        <div style={{ width: 200, padding: 10 }}>
          <button onClick={addSection}>Add Section</button>

          <input
            placeholder="Page name"
            onChange={(e) => setPageId(e.target.value)}
          />

          <button onClick={savePage}>Save</button>
          <button onClick={loadPage}>Load</button>
        </div>

        {/* CANVAS */}
        <div style={{ flex: 1, padding: 20 }}>
          {tree.map(renderElement)}
        </div>

      </div>
    </DndContext>
  );
      }
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

  // ---------- STYLE ----------
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

          <div style={{ display: "flex", alignItems: "stretch" }}>
            {el.children.map((col, i) => (
              <React.Fragment key={col.id}>
                
                <DropZone id={col.id}>
                  <div
                    style={{
                      flex: col.width,
                      border: "1px dashed gray",
                      padding: 10
                    }}
                  >
                    <button onClick={() => addElement(col.id, "text")}>Text</button>
                    <button onClick={() => addElement(col.id, "image")}>Image</button>
                    <button onClick={() => addElement(col.id, "button")}>Button</button>

                    {col.children.map((child) => (
                      <Draggable key={child.id} id={child.id}>
                        <div onClick={() => setSelected(child)}>
                          {renderElement(child)}
                        </div>
                      </Draggable>
                    ))}
                  </div>
                </DropZone>

                {/* RESIZE HANDLE */}
                {i < el.children.length - 1 && (
                  <div
                    style={{
                      width: 6,
                      cursor: "col-resize",
                      background: "#ccc"
                    }}
                    onMouseDown={(e) => {
                      const startX = e.clientX;

                      const onMove = (moveEvent) => {
                        const diff = moveEvent.clientX - startX;
                        const newWidth = col.width + diff * 0.2;
                        resizeColumns(el.id, i, newWidth);
                      };

                      document.addEventListener("mousemove", onMove);
                      document.addEventListener(
                        "mouseup",
                        () => {
                          document.removeEventListener("mousemove", onMove);
                        },
                        { once: true }
                      );
                    }}
                  />
                )}

              </React.Fragment>
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

        {/* LEFT PANEL */}
        <div style={{ width: 200, borderRight: "1px solid #ccc", padding: 10 }}>
          <button onClick={addSection}>Add Section</button>

          <div style={{ marginTop: 20 }}>
            <button onClick={() => setDevice("desktop")}>Desktop</button>
            <button onClick={() => setDevice("tablet")}>Tablet</button>
            <button onClick={() => setDevice("mobile")}>Mobile</button>
          </div>
        </div>

        {/* CANVAS */}
        <div
          style={{
            flex: 1,
            padding: 20,
            display: "flex",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width:
                device === "mobile"
                  ? 375
                  : device === "tablet"
                  ? 768
                  : "100%",
              border: "1px solid #ccc",
              padding: 10
            }}
          >
            {tree.map(renderElement)}
          </div>
        </div>

        {/* STYLE PANEL */}
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
