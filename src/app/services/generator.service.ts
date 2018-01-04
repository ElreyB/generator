import { Variable } from './../variable';
import { Injectable } from '@angular/core';
//import { Variable } from '../variable';

import './../../../node_modules/nerdamer/nerdamer.core.js';
import './../../../node_modules/nerdamer/Solve.js';
import './../../../node_modules/nerdamer/Algebra.js';
import './../../../node_modules/nerdamer/Calculus.js';
import './../../../node_modules/nerdamer/Extra.js';

declare var nerdamer: any;

@Injectable()
export class GeneratorService {

  constructor() { }
  /* This method inputs parameters of variables with min and max values and
    generates sets that include all the permutations of these variables. */
  // IN PROGRESS FOR DECIMAL ROBERT
  generatePermutations(parametersArray: Variable[]): any[] {
    let temp = []; // Stores running array of values for each index place.
    let answerArray = [];  // Array returned with all possible permutation sets.
    // Locates index of last variable.
    let numberOfVariables = parametersArray.length - 1;

    /** For loop calculates the total number of permutations based on the range
      of the input parameters.  **/
    let totalPermutations = 1;
    for (let i = 0; i < numberOfVariables; i++) {
      /** Range includes subtracting minimum from maximum and adding 1 to
        include the minimum and maximum numbers **/
    	let range = (parametersArray[i].max - parametersArray[i].min) *
      ((Math.pow(10, parametersArray[i].decPoint))) + 1;
    	totalPermutations *= range;
      console.log(totalPermutations);
    }
    // totalPermutations = 500000;

    // Intializes temp[] array with all the minimum parameters.
    for (let i = 0; i < numberOfVariables; i++) {
    	temp[i] = parametersArray[i].min;
    }

    /* This method is run as a for loop through all the calculated
      Permutations.  The index value is only used in order to track when
      all sets are generated. */
    for (let index = 0; index < totalPermutations; index++) {
    	let arrayValues = [];  // This will be pushed to final answerArray.

      // Sets arrayValues to previous temp[] values.
      for (let i = 0; i < numberOfVariables; i++) {
      	arrayValues[i] = temp[i];
      }

      /*If statement is true if the last element has not reached the maximum
        value.  It causes the last element to increase to the next in
        order. **/
      // Gets temp ready for the next run.
      if (temp[numberOfVariables - 1] <= parametersArray[numberOfVariables - 1].max) {
        temp[numberOfVariables - 1]
        += 1 / Math.pow(10, parametersArray[numberOfVariables - 1].decPoint);
        // temp[numberOfVariables - 1] = temp[numberOfVariables - 1].toFixed(parametersArray[numberOfVariables - 1].decPoint);
      }

      /** Else takes care of the situation where elements other than the last
          one (right-most) need to be changed.  **/
      else {
        /** Index i starts on the right-most element and works to the left.
            If this addition brings the temp[i-1] to above the maximum,
            this will be taken care in the next iteration of the for loop.**/
        for (let i = numberOfVariables - 1; i >= 0; i--) {
          // if current temp[i] value has reached the parameter maximum.
          if (temp[i] > parametersArray[i].max) {
    				temp[i] = parametersArray[i].min; // current temp[i] set to minimum.
            temp[i - 1]
            += 1/Math.pow(10, parametersArray[i - 1].decPoint);

            //temp[i - 1] = temp[i - 1].toFixed(parametersArray[i - 1].decPoint);
            // temp[i-1] (one to the left) is added.
          }
          arrayValues[i] = temp[i];  /** For loop ends with that temp[i]
          finalized in arrayValues. **/
        }
        // Adds to last element in array.
        temp[numberOfVariables - 1]
        += 1/Math.pow(10, parametersArray[numberOfVariables - 1].decPoint);
        // temp[numberOfVariables - 1] = temp[numberOfVariables - 1].toFixed(parametersArray[numberOfVariables - 1].decPoint);
      }
      // For each index value, a set is pushed to the answerArray.
      answerArray.push(arrayValues);
    }
    return answerArray;
  }

  createVariableObject(randomSet: number[], variables: Variable[]): object {
    const variablesObject = {};
    for (let i = 0; i < variables.length - 1; i++) {
      const objectName = variables[i].name;
      variablesObject[objectName] = randomSet[i];
    }
    return variablesObject;
  }
  // IN PROGRESS KIM CHANGE TO 'SOLVE()' --possible refactoring
  solveForVariable(randomSet: number[], simplifiedEquation: string, variables: Variable[]): any[] {
    let answerArray: any[] = [];
    
    let variablesObject = this.createVariableObject(randomSet, variables);

    let answer: string = nerdamer(simplifiedEquation, variablesObject);
    console.log(answer.toString());
    
    let decimalAnswer: string  = nerdamer(answer).text('decimal');
    console.log('decimalAnswer');
    console.log(decimalAnswer);
    
    
    let decimalAnswerArray: string[] = decimalAnswer.split(/[\[,\]]/);
    console.log(decimalAnswer);
    
    for (let i = 0; i < decimalAnswerArray.length; i++) {
      if (decimalAnswerArray[i] !== '') {
        answerArray.push(decimalAnswerArray[i]);
      }
    }
    // for (let i = 0; i < answerValues.symbol.elements.length; i++) {
    //   let expressionValue = answerValues.symbol.elements[i].value;
    //   console.log(expressionValue);
    //   if (expressionValue === '#'|| expressionValue === 'i') {
    //     let numerator = answerValues.symbol.elements[i].multiplier.num.value;
    //     let denominator = answerValues.symbol.elements[i].multiplier.den.value;
    //     expressionValue = numerator/denominator;
    //     expressionValue = expressionValue.toFixed(variables[variables.length-1].decPoint);
    //   }
    //   else {
    //     expressionValue = nerdamer(expressionValue).text('decimals');
    //   }
    //   answerArray.push(expressionValue);
    // }
    return answerArray;
  }

  // This method simplifies the equation and returns an expression
  simplifyEquation(equation: string, variableToSolve: string): string {
    const simplifiedEquation = nerdamer.solve(equation, variableToSolve);
    return simplifiedEquation.toString();
  }

  compareResultWithUserSpecification(values: any[], variables: Variable[]): boolean {
    let inRange = false;
    let sameDataType = false;
    // tslint:disable-next-line:max-line-length
    const lastVariable = variables[variables.length - 1]; // the last variable in the variables array. we are making an assumption that we are solving for the last variable

    // check if value is an integer/decimal.
    for (let i = 0; i < values.length; i++) {
      const currentValue = values[i];

    // check if value is an imaginary number
    // I am assuming that we dont check for the range if it is imaginary
      if (this.containsImaginary(currentValue) && lastVariable.isImaginary) {
        return true;
      }

      if (lastVariable.decPoint === 0 && this.isInt(currentValue)) {
        sameDataType = true;
      } else if (lastVariable.decPoint > 0 && this.calculateDecimalPlaces(currentValue) > 0) {
        sameDataType = true;
      }
      // check if value is in range.
      if (currentValue >= lastVariable.min && currentValue <= lastVariable.max) {
        inRange = true;
      }
    }

    // if parameters are met, function will return true.
    if (inRange && sameDataType) {
      return true;
    } else {
      return false;
    }
  }

  calculateLastVariable(parametersArray: Variable[], testSet: number) {
    let variablesObject = [];

    for (let i = 0; i < parametersArray.length; i++) {
      variablesObject[parametersArray[i].name] = testSet[i];
    }
    return variablesObject;
  }

  getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; // The maximum and the minimum is inclusive
  }

  splicePermutationSetRandomly(permutationsList: any[]): any[] {
    let splicingIndex: number = this.getRandomIntInclusive(0, permutationsList.length-1);
    let result = permutationsList.splice(splicingIndex, 1); // it returns [[...]]
    return result;
  }

  toArray(obj) {
    let objArr = Object.keys(obj).map(function(key){
      return [String(key), obj[key]];
    });
    return objArr;
  }

  isInt(input: any): boolean {
    let parsedInput = Number(input);
    if (parsedInput !== NaN && Math.floor(parsedInput) === parsedInput) {
      return true;
    }else {
      return false;
    }
  }

  containsImaginary(input: string ) {
    if (input.includes('i')) {
      return true;
    } else {
      return false;
    }
  }

  calculateDecimalPlaces(input: string): number {
    const inputArr = input.split('.');
    if(inputArr.length === 1) {
      return 0;
    } else {
      return inputArr[1].length;      
    }
  }


  generateValidVariableCombination(variables: Variable[], numberOfProblems: number, equation: string): any[] {
    variables[variables.length-1].isImaginary = true;
    // From the 'permutationsList' generate a random set and save it in 'randomSet' varialble

    // Check if it is valid set or not as per to the user's condition
    // If it is valid then push it to the 'result' array
    const result: any[] = [];
    const permutationsList: any[] = this.generatePermutations(variables);
   
    console.log(permutationsList);

    // tslint:disable-next-line:max-line-length
    let simplifiedEquation = this.simplifyEquation(equation, variables[variables.length - 1].name); // This runs only once per 'permutationsList', and we use the 'simplifiedEquation' to check the validity of each 'randomSet'.
    simplifiedEquation = nerdamer(simplifiedEquation).text('decimal');

    while (result.length !== numberOfProblems && permutationsList.length > 0) {
       const randomSet: any[] = this.splicePermutationSetRandomly(permutationsList);  // splice a permutation set randomly
     
      const answerArray  = this.solveForVariable(randomSet[0], simplifiedEquation, variables);

      if (this.compareResultWithUserSpecification(answerArray, variables)) {
        randomSet[0].push(answerArray);
        result.push(randomSet[0]);
      }
    }

    return result;
  }


  
  reverseLaTex(input) {
    let arr = [];
    let reversedLaTex = "";
    let inputArr = input.split(/[+\s]/);
    let n = inputArr.length;
    console.log(inputArr);
    if (inputArr[n-2] === "=") {
      for(var i = inputArr.length-3; i>=0; i--) {
        if(inputArr[i].length !== 0) {
          arr.push(inputArr[i]);
        }
      }
    reversedLaTex = arr.join(' + ');
    reversedLaTex+= " = 0";
    } else {
      for(var i = inputArr.length-1; i>=0; i--) {
        if(inputArr[i].length !== 0) {
          arr.push(inputArr[i]);
        }
      }
      reversedLaTex = arr.join(' + ');
    }
    return reversedLaTex;
  }

  convertProblemToLaTeX(variables: Variable[], equation: string, validPermutaion): string {
    let variablesObject = this.createVariableObject(validPermutaion, variables);

    console.log(variablesObject);

    let nerdamerAnswer = nerdamer(equation, variablesObject).toString();
    let laTeXAnswer = nerdamer.convertToLaTeX(nerdamerAnswer);
    console.log("LaTex: " + laTeXAnswer);

    let reversedLaTeX = this.reverseLaTex(laTeXAnswer);

    return laTeXAnswer;
  }

  generateProblem(validPermutations: any[], equation: string, variables: Variable[]): string[] {
    let result: string[] = [];
   // [[1, 2, [-3,3]]]
    //let variableObject = this.createVariableObject()

    return result;
  }
}
