import type {
  CanvasScene,
  ExcalidrawElement,
} from "../../packages/excalidraw/element/types";
import type { AppState } from "../../packages/excalidraw/types";
import {
  clearAppStateForLocalStorage,
  getDefaultAppState,
} from "../../packages/excalidraw/appState";
import { clearElementsForLocalStorage } from "../../packages/excalidraw/element";
import { STORAGE_KEYS } from "../app_constants";

export const saveUsernameToLocalStorage = (username: string) => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_STORAGE_COLLAB,
      JSON.stringify({ username }),
    );
  } catch (error: any) {
    // Unable to access window.localStorage
    console.error(error);
  }
};

export const importUsernameFromLocalStorage = (): string | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_COLLAB);
    if (data) {
      return JSON.parse(data).username;
    }
  } catch (error: any) {
    // Unable to access localStorage
    console.error(error);
  }

  return null;
};

export const importFromLocalStorage = () => {
  let savedElements = null;
  let savedState = null;
  let canvasId: string | null = null;

  try {
    savedElements = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS);
    savedState = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_APP_STATE);
    canvasId = localStorage.getItem("canvasId");

    if (!canvasId) {
      localStorage.setItem("canvasId", "initial");
    }

    if (!savedElements) {
      const initialScene: CanvasScene = {
        scenes: [
          {
            id: "initial",
            name: "Initial Scene",
            elements: [],
          },
        ],
      };
      console.log("Initial Scene: ", JSON.stringify(initialScene));
      localStorage.setItem(
        STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS,
        JSON.stringify(initialScene),
      );
      savedElements = JSON.stringify(initialScene);
    }

    if (!savedState) {
      const initialState = getDefaultAppState();
      localStorage.setItem(
        STORAGE_KEYS.LOCAL_STORAGE_APP_STATE,
        JSON.stringify(initialState),
      );
      savedState = JSON.stringify(initialState);
    }
  } catch (error: any) {
    // Unable to access localStorage
    console.log("Error accessing localStorage: ", error);
    console.error(error);
  }

  const elements = JSON.parse(savedElements || "{}") as CanvasScene;

  // const elements = clearElementsForLocalStorage(
  //   JSON.parse(savedElements || "{}") as CanvasScene,
  // ) as CanvasScene;
  const currentScene = elements?.scenes.find((scene) => scene.id === canvasId);
  const newElements = clearElementsForLocalStorage(
    currentScene?.elements || [],
  );

  let appState = null;
  if (savedState) {
    try {
      appState = {
        ...getDefaultAppState(),
        ...clearAppStateForLocalStorage(
          JSON.parse(savedState) as Partial<AppState>,
        ),
      };
    } catch (error: any) {
      console.error(error);
      // Do nothing because appState is already null
    }
  }
  console.log("Exported Elements: ", newElements);
  return { elements: newElements, appState };
};

export const getElementsStorageSize = () => {
  try {
    const elements = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS);
    const elementsSize = elements?.length || 0;
    return elementsSize;
  } catch (error: any) {
    console.error(error);
    return 0;
  }
};

export const getTotalStorageSize = () => {
  try {
    const appState = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_APP_STATE);
    const collab = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_COLLAB);

    const appStateSize = appState?.length || 0;
    const collabSize = collab?.length || 0;

    return appStateSize + collabSize + getElementsStorageSize();
  } catch (error: any) {
    console.error(error);
    return 0;
  }
};
