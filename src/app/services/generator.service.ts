/* tslint:disable:max-line-length */
import {
  Variable
} from './../variable';
import {
  Injectable
} from '@angular/core';
import * as _ from 'lodash';
import {
  solveForUnknownVariable,
  simplifyEquation,
  getRangeValues,
  generatePermutations,
  meetsUnknownVariableSpecification,
  pullRandomValue,
  getCollisionRisk,
  genRandomPermutation,
  isVariableInArray
} from './../utilities/utilities';

const COLLISION_THRESHOLD = 0.9;
const MAX_INVALID_COUNTER = 100;

@Injectable()
export class GeneratorService {

  generatePermutationsByRandom(variables: Variable[], numberOfProblems: number, equation: string): any[] {
    const result = [];
    let invalidCounter = 0;
    const simplifiedEquation = simplifyEquation(equation, variables[variables.length - 1].name);
    while (result.length < numberOfProblems && invalidCounter < MAX_INVALID_COUNTER) {
      const permutation = genRandomPermutation(variables);
      const unknownVariable = _.last(variables);
      const answer = solveForUnknownVariable(permutation, simplifiedEquation, variables);
      const isValid = meetsUnknownVariableSpecification(answer, unknownVariable);
      const isNew = !isVariableInArray(permutation, result);

      if (isValid && isNew) {
        invalidCounter = 0;
        result.push([...permutation, [answer]]);
      } else {
        invalidCounter++;
      }
    }
    return result;
  }

  generatePermutationsFromList(variables: Variable[], numberOfProblems: number, equation: string) {
    const result = [];
    const permutationsList = generatePermutations(variables);
    const unknownVariable = _.last(variables);
    const simplifiedEquation = simplifyEquation(equation, unknownVariable.name);
    while (result.length < numberOfProblems && permutationsList.length > 0) {

      const permutation = pullRandomValue(permutationsList);
      const answer = solveForUnknownVariable(permutation, simplifiedEquation, variables);
      const isValid = meetsUnknownVariableSpecification(answer, unknownVariable);

      if (isValid) {
        result.push([...permutation, [answer]]);
      }
    }
    return result;
  }
  /**
   * There could be a very large number of possible solutions (e.g. many decimal, number of problems, large range)
   * when that happens, we pick a permutations at random
   * but when the possibilities are small or we want a large fraction of them, we pick them from the full list otherwise the collision risk is too high.
   */
  solverDecisionTree(variables: Variable[], numberOfProblems: number, equation: string): any[] {
    const collisionRisk = getCollisionRisk(variables, numberOfProblems);
    numberOfProblems = Math.min(numberOfProblems, 500);
    if (collisionRisk > COLLISION_THRESHOLD) {

      return this.generatePermutationsFromList(variables, numberOfProblems, equation);
    }

    return this.generatePermutationsByRandom(variables, numberOfProblems, equation);
  }

}
