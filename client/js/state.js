let state = {
  activeFormId: "football-talent",
  formConfig: null,
  currentStepIndex: 0,
  answers: {},
  historyStack: []
};

export function getState() {
  return state;
}

export function setState(newState) {
  state = { ...state, ...newState };
}

export function getAnswer(id) {
  return state.answers[id];
}

export function setAnswer(id, value) {
  state.answers[id] = value;
}

export function removeAnswer(id) {
  delete state.answers[id];
}

export function resetState() {
  state.currentStepIndex = 0;
  state.historyStack = [];
  state.answers = {};
}
