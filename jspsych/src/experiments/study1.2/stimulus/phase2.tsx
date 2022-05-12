import {Alert, Button, Card} from "../../../components/bootstrap";
// @ts-ignore
import React, {useRef, useState} from "react"
// @ts-ignore
import ReactDOM from "react-dom"
import ReactMarkdown from "react-markdown"
import gfm from "remark-gfm"
import {Form, Field} from "react-final-form"

import _ from "lodash"
import createCalculatorDecorator from "final-form-calculate";
import {JsPsych} from "jspsych";
import {Decorator, FormApi} from "final-form";


const Error = (meta) => {
  const components = {
    p: (props) => <div className={"invalid-feedback mb-0"} {...props} />
  }
  const error = meta.error ?? ""
  return <ReactMarkdown children={error} remarkPlugins={[gfm]} components={components}/>
}

const InputGroup = ({name, label, placeholder, prompt = "", type = "text", validate}) => {
  return <Field name={name} validate={validate}>
    {({input, meta}) => {
      const actuallyErrored = meta.error && meta.touched
      
      const inputClasses = ["form-control", (actuallyErrored ? "is-invalid" : undefined)]
        .filter((s: string) => s)
        .join(" ")
      
      const nameLabel = label.replace("type error", "typeError")
      
      return <div className={"input-group has-validation"}>
        <label className="col-sm-2 col-form-label"> <span className={nameLabel}><strong>{label}</strong></span> </label>
        {prompt.length > 0 && <span className="input-group-text">{prompt}</span>}
        <input type={type} {...input} className={inputClasses} required placeholder={placeholder}/>
        <Error {...meta} />
      </div>
    }}
  </Field>
}

const required = (value: any): string | undefined => value ? undefined : "**Required**"

const checkForSpace = (word: string): string | undefined => {
  if (word.includes(" ") || _.isEmpty(word)) {
    return "A **space** was detected. Please remove it."
  }
  return undefined
}

const checkForPunct = (word: string, sent: boolean = false): string | undefined => {
  const re = /[.?,\/#!$%^&*;:{}=\-_`'~()]/g
  const lastWord = word.trim().split(" ").pop()
  const sentErr = "The end of the sentence must be a word _without special characters or punctuation_, **please edit the last word**."
  
  if (lastWord.match(re)) {
    return (sent ? sentErr : "**Punctuation** was detected. **Please remove it**.")
  }
  return undefined
}

const moreThan = (sentence: string, nWords: number) => {
  return sentence.trim().split(" ").length >= nWords ? undefined : `Please enter more than a **${nWords}-word** sentence.`
}

type Phase2Response = {
  [field: string]: string
  // sentence: string
  // prompt: string
  // probable: string
  // improbable: string
  // impossible: string
  // typeError: string
}

const checkForDupes = (entries: Phase2Response) => {
  const dupes = {}
  const desiredKeys: string[] = ['probable', 'improbable', 'impossible', 'typeError']
  
  const picked: Phase2Response = _.pick(entries, desiredKeys)
  const values: string[] = _.values(picked)
  
  if (_.uniq(values).length != values.length) {
    const counts = _.countBy(values)
    for (const [word, count] of _.entries(counts)) {
      if (count == 1)
        continue  // skip
      
      const occurrences = _.tail(values.map((v: string, n: number) => (
        v == word ? n : undefined
      )).filter(e => e != undefined))
      
      for (const occurrence of occurrences) {
        dupes[desiredKeys[occurrence]] = `You used the word "**${word}**" earlier. Please choose a different word.`
      }
    }
  }
  
  return dupes
}

const composeValidators = (...validators) => word =>
  validators.reduce((error, validator) => error || validator(word), undefined)

const wrapSubmit = (jsPsych: JsPsych) => {
  console.log(jsPsych)
  return (values: any, api: FormApi, callback: any) => {
    jsPsych.finishTrial(values)
    return undefined
  }
}

const extractProbable: Decorator = createCalculatorDecorator(
  {
    field: "sentence",
    updates: {
      probable: (value) => value?.trim().split(" ").pop()
    }
  },
  {
    field: "sentence",
    updates: {
      prompt: (value) => value?.trim().split(" ").slice(0, -1).join(" ") ?? " "
    }
  }
)

const Page = ({jsPsych, ...props}) => {
  const decorators: Decorator[] = [extractProbable]
  const validate = checkForDupes
  
  const formConfig = {decorators, onSubmit: wrapSubmit(jsPsych), validate}
  
  return <Form {...formConfig}>
    {({handleSubmit, values, invalid, ...rest}) => {
      const prompt = values.sentence?.trim().split(" ").slice(0, -1).join(" ") ?? " "
      return <form onSubmit={handleSubmit}>
        <Card klass="stimulus">
          <Card.Header>Please provide 4 scenarios below</Card.Header>
          <Card.Body klass="stimulus-body">
            <InputGroup name="sentence" label="probable"
                        validate={composeValidators(required, (word) => moreThan(word, 2), (word) => checkForPunct(word, true))}
                        placeholder="A probable sentence"/>
            <Field name="probable" type="hidden" component="input" disabled/>
            <InputGroup name="improbable" label="improbable" validate={composeValidators(required, checkForSpace, checkForPunct)}
                        placeholder="A word to make this sentence improbable" prompt={prompt}/>
            <InputGroup name="impossible" label="impossible" validate={composeValidators(required, checkForSpace, checkForPunct)}
                        placeholder="A word to make this sentence impossible" prompt={prompt}/>
            <InputGroup name="typeError" label="type error" validate={composeValidators(required, checkForSpace, checkForPunct)}
                        placeholder="A word to make this sentence a type error" prompt={prompt}/>
            {/*<pre className="chroma">*/}
            {/*  <code>{JSON.stringify(values)}</code>*/}
            {/*</pre>*/}
          </Card.Body>
          <Card.Footer>
            <Button.Next disabled={invalid}/>
          </Card.Footer>
        </Card>
      </form>
    }}
  </Form>
}

export default Page