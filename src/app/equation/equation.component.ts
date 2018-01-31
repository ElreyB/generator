import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Variable } from '../variable';
import { GeneratorService } from '../services/generator.service';
import * as _ from 'lodash';
import * as nerdamer from 'nerdamer';

import 'nerdamer/Solve';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import 'nerdamer/Extra';

declare var Guppy: any;   // declaring Guppy
declare var GuppyOSK: any;

@Component({
  selector: 'app-equation',
  templateUrl: './equation.component.html',
  styleUrls: ['./equation.component.css']
})
export class EquationComponent implements OnInit {
  error = null;
  guppyBox = false;
  parameterDiv = false;
  generatedView = false;
  isLoading = false;
  equation: string;
  variables: Variable[] = [];
  variableToSolve: Variable = null;
  canContainImaginary = false;
  meetParameterCondition = false;
  generatedCombinations: any[] = [];
  numberOfProblems: number;
  errorsView = false;

  constructor(private _generatorService: GeneratorService) { }

  ngOnInit() {
    Guppy.init_symbols(['/assets/symbols.json']);
    const guppy = new Guppy('equationBox');
    // window.G = Guppy
    // window.g = guppy
  }

  /* this is to get the content of the guppy box,
    it also converts the mathematical equation/expression into the desired format type(latex, asciimath, text, ast, eqns, function, xml)*/
  output() {
    try {
      this.error = null;
      this.equation = Guppy.instances['equationBox'].backend.get_content('text');
      const extractedVars = nerdamer(this.equation).variables();
      /* creating variable instance and pushing each variable instance into the variables array*/
      for (let i = 0; i < extractedVars.length; i++) {
        const varName: string = extractedVars[i];
        const newVar = new Variable(varName);
        this.variables.push(newVar);
      }
      console.log(this.variables);
      this.parameterDiv = true;
    } catch (e) {

      this.error = 'Parsing error!' + e;
    }
  }

  onSubmit(formValue) {

    // this logic updates the variables array value using the data obtained from the for
    this.generatedView = false;
    this.isLoading = true;
    _.delay(() => {
      for (let i = 0; i < this.variables.length - 1; i++) {
        if (this.variables[i].min >= this.variables[i].max) {
          this.isLoading = false;
          return this.errorsView = true;
        }
      }
      this.numberOfProblems = formValue.value.numberOfProblems;
      if (this.variableToSolve) {
        for (let i = 0; i < this.variables.length; i++) {
          const currentVarObj = this.variables[i];
          if (currentVarObj.name === this.variableToSolve.name) {
            this.variables[i].solveForThisVariable = true;
            this.variables[i].containsImaginary = this.canContainImaginary;
            this.variables[i].answerMeetsAllSpecification = this.meetParameterCondition;
          }
        }
        // this takes the variable to solve to the end of the array.
        this.switchParameterToSolve(this.variables, this.variableToSolve);
      }
      const result = this._generatorService.solverDecisionTree(this.variables, this.numberOfProblems, this.equation);
      this.generatedCombinations = result;
      console.log(this.generatedCombinations);
      console.log(formValue);
      this.isLoading = false;
      this.generatedView = true;
    }, 100);
  }

  switchParameterToSolve(variables: Variable[], variableToSolve: Variable): void {
    const lastVariable = variables[variables.length - 1];
    for (let i = 0; i < variables.length; i++) {
      const currentVar = variables[i];
      if (currentVar.solveForThisVariable === true) {
        variables[variables.length - 1] = currentVar;
        variables[i] = lastVariable;
        break;
      }
    }
  }
}
