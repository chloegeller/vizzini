import {JsPsych, JsPsychPlugin, ParameterType, TrialType} from "jspsych";
// @ts-ignore
import React from "react";
// @ts-ignore
import ReactDOM from "react-dom";
import ReactDOMClient from "react-dom/client"
import _ from "lodash";

const info = <const>{
  name: "MDXFillBlankPlugin",
  parameters: {
    Component: {
      type: ParameterType.FUNCTION,
      required: true,
    },
    getResponses: {
      type: ParameterType.FUNCTION,
      required: true,
      description: "Get the responses stored in the React component",
    }
  },
};

type Info = typeof info;

type ResponseError = any

type InputEventListener = EventListenerOrEventListenerObject


class ErrorQueue {
  toAdd: Set<string> = new Set<string>()
  toDel: Set<string> = new Set<string>()
  
  push(value: string) {
    this.toAdd.add(value)
    this.toDel.delete(value)
  }
  
  remove(value: string) {
    this.toAdd.delete(value)
    this.toDel.add(value)
  }
  
  get hasErrors() {
    return this.toAdd.size > 0
  }
  
  get add(): string[] {
    return Array.from(this.toAdd)
  }
  
  get del(): string[] {
    return Array.from(this.toDel)
  }
}

const getResponseID = (input: HTMLInputElement): string => {
  return input.dataset.responseId
}

class MDXFillBlankPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private startTime: number;
  private inputs: {
    probable?: HTMLInputElement,
    improbable?: HTMLInputElement,
    impossible?: HTMLInputElement,
    typeError?: HTMLInputElement,
  } = {}
  private responses: {
    probable?: string | ResponseError,
    improbable?: string | ResponseError
    impossible?: string | ResponseError,
    typeError?: string | ResponseError,
  } = {}
  private errors: {
    probable: ErrorQueue,
    improbable: ErrorQueue,
    impossible: ErrorQueue,
    typeError: ErrorQueue,
    global: ErrorQueue,
  } = {
    probable: new ErrorQueue(),
    improbable: new ErrorQueue(),
    impossible: new ErrorQueue(),
    typeError: new ErrorQueue(),
    global: new ErrorQueue(),
  }
  
  constructor(private jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
  }
  
  trial(container: HTMLElement, trial: TrialType<Info>) {
    const root: ReactDOMClient = this.jsPsych.extensions.react.getRoot()
    root.render(trial.Component(trial), container);
    
    this.startTime = performance.now();
    
    this.inputs.probable = <HTMLInputElement>container.querySelector("[data-response-id='probable']");
    this.inputs.improbable = <HTMLInputElement>container.querySelector("[data-response-id='improbable']");
    this.inputs.impossible = <HTMLInputElement>container.querySelector("[data-response-id='impossible']");
    this.inputs.typeError = <HTMLInputElement>container.querySelector("[data-response-id='typeError']");
    
    // this.inputs.probable.addEventListener("input", () => {
    // // this.updateSentencePrompt(this.inputs.probable)
    // this.addInputListener(this.inputs.probable, this.updateSentencePrompt)
    // this.addErrorListener(this.inputs.probable, this.inputSentencePunctuationError)
    
    // this.addErrorListener(this.inputs.improbable, this.spaceError);
    // this.addErrorListener(this.inputs.improbable, this.punctuationError, this.spaceError);
    // this.addInputListener(this.inputs.improbable, this.setResponseWord);
    //
    // this.addErrorListener(this.inputs.impossible, this.punctuationError, this.spaceError);
    // this.addInputListener(this.inputs.impossible, this.setResponseWord);
    //
    // this.addErrorListener(this.inputs.typeError, this.punctuationError, this.spaceError);
    // this.addInputListener(this.inputs.typeError, this.setResponseWord);
    
    let nextBtn = <HTMLButtonElement>document.getElementById("next");
    nextBtn.addEventListener("click", () => {
      this.validate(this.inputs.probable, this.testForEmpty, this.testForPunct)
      this.validate(this.inputs.improbable, this.testForEmpty, this.testForSpace, this.testForPunct)
      this.validate(this.inputs.impossible, this.testForEmpty, this.testForSpace, this.testForPunct)
      this.validate(this.inputs.typeError, this.testForEmpty, this.testForSpace, this.testForPunct)
      
      this.validateGlobalState(container)
      
      this.endTrial(container, trial);
    });
  }
  
  validate(input: HTMLInputElement, ...errorFns: Function[]): void {
    const responseID = getResponseID(input)
    
    let word = input.value;
    for (const errorFn of errorFns) {
      word = errorFn(input, word ?? input.value)
      if (word == undefined)
        break
    }
    
    console.log(responseID, this.errors[responseID].add)
    const errors = this.errors[responseID]  // sugar
    if (errors.hasErrors) {
      input.classList.add("is-invalid")
    } else {
      input.classList.remove("is-invalid")
    }
    this.responses[responseID] = word
    
    input.classList.add(...errors.add)
    input.classList.remove(...errors.del)
  }
  
  /** Adds error functions to the given `input` element, while ensuring that the `.is-invalid` isn't removed unless
   *   the `input` is entirely error-free */
  addErrorListener(input: HTMLInputElement, ...errors: InputEventListener[]): void {
    for (const error of errors) {
      input.addEventListener("input", error)
    }
    input.addEventListener("input", _.debounce(() => {
      this.validate(input)
    }, 2000, {trailing: true, maxWait: 10000}))
  }
  
  addInputListener(input: HTMLInputElement, ...callbacks: InputEventListener[]): void {
    for (const callback of callbacks) {
      input.addEventListener("input", callback)
    }
  }
  
  validateGlobalState(container: HTMLElement): void {
    const alert = container.querySelector("#form-global-error")
    const responses: string[] = _.values(this.responses)
    if (responses.length !== _.uniq(responses).length) {
      // We have an error
      this.errors.global.push("invalid-words")
    }
    
    if (this.errors.global.hasErrors) {
      alert.classList.add("is-invalid")
    } else {
      alert.classList.remove("is-invalid")
    }
    
    alert.classList.add(...this.errors.global.add)
    // alert.classList.remove(...this.errors.global.remove)
  }
  
  testForEmpty(input: HTMLInputElement, word: string): string | undefined {
    const responseID = getResponseID(input);
    if (_.isEmpty(word)) {
      this.errors[responseID].push("is-empty")
      return undefined;
    } else {
      this.errors[responseID].remove("is-empty")
      return word;
    }
  }
  
  testForSpace(input: HTMLInputElement, word: string): string | undefined {
    const responseID = getResponseID(input)
    if (word.includes(" ") || _.isEmpty(word)) {
      this.errors[responseID].push("has-space")
      return undefined
    } else {
      this.errors[responseID].remove("has-space")
      return word
    }
  }
  
  testForPunct(input: HTMLInputElement, word: string): string | undefined {
    const responseID = getResponseID(input)
    const re = /[.?,\/#!$%^&*;:{}=\-_`'~()]/g
    const lastWord = word.trim().split(" ").pop()
    
    if (lastWord.match(re)) {
      this.errors[responseID].push("has-punct")
      return undefined
    } else {
      this.errors[responseID].remove("has-punct")
      return word
    }
  }
  
  updateSentencePrompt(input: HTMLInputElement): void {
    if (_.isEmpty(input.value)) {
      return
    }
    
    const formGroup = input.parentElement
    
    const sentence = input.value.trim().split(" ")
    sentence.pop()
    const sentenceStr = sentence.join(" ")
    
    formGroup.parentElement.querySelectorAll(".sentence-prompt").forEach((input: HTMLInputElement) => {
      input.innerText = sentenceStr;
    })
  }
  
  
  gatherResponses(container: HTMLElement) {
    const results = {
      rt: performance.now() - this.startTime,
    };
    
    const probable = <HTMLInputElement>container.querySelector("#participant-sent-probable")
    if (_.isEmpty(probable.value)) {
      return results;
    }
    
    const sentence = probable.value.trim().split(" ")
    const lastWord = sentence.pop().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    if (lastWord.includes("'")) {
      probable.classList.add("is-invalid")
      return
    }
    const sentenceStr = sentence.join(" ")
    
    container.querySelectorAll(".change-word").forEach((input: HTMLInputElement) => {
      input.innerText = sentenceStr;
    })
    
    return results;
  }
  
  endTrial(container: HTMLElement, trial: TrialType<Info>) {
    const results = this.gatherResponses(container);
    if (!_.isEmpty(_.omit(results, "rt"))) {
      this.jsPsych.pluginAPI.clearAllTimeouts();
      this.jsPsych.finishTrial(results);
    }
  }
}

export default MDXFillBlankPlugin;

