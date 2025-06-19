import {Component, computed, effect, inject, signal, Signal} from '@angular/core';
import {UserService} from '../../service/userService';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {User} from '../../model/user';
import {toSignal} from '@angular/core/rxjs-interop';
import {debounceTime, filter, map, startWith} from 'rxjs'; // external dep 4x
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-signal-form',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './signal-form.component.html',
  styleUrl: './signal-form.component.css'
})
/**
 * Represents a signal version of a reactive registration form with extended validation
 */
export class SignalFormComponent {
  private userService = inject(UserService);
  protected userForm: FormGroup;
  // existing collection of users
  protected users: Signal<User[] | undefined>;
  // reactive form state handling
  protected userNameStatus: Signal<string>;
  protected emailStatus: Signal<string>;
  protected formFieldStatus: Signal<string | undefined>;
  // reactive form field access values for change detection
  // signal forms are not available yet in angular v19
  protected userNameSignal: Signal<string>;
  protected emailAddressSignal: Signal<string>;
  // evaluation methods
  protected isEmailAddressTaken: Signal<boolean>;
  protected isUserNameTaken: Signal<boolean | undefined>;
  protected canSubmit: Signal<boolean>;
  // direct user feedback on duplicated usernames
  protected userSearchResults: User[] | undefined;
  // evaluation counter
  protected counter = signal<number>(0);


  constructor(private formBuilder: FormBuilder) {
    // initialize user collection via http-request - lazy observable to signal for synchronous interaction
    this.users = toSignal(this.userService.getUsers()); // logicStep // operator
    // initialize form fields
    this.userForm = this.formBuilder.group({ // logicStep
        username: ["", [Validators.required, Validators.minLength(3)]],
        firstName: ["", [Validators.required]],
        lastName: ["", [Validators.required]],
        emailAddress: ["", [Validators.required, Validators.email]],
        address: ["", Validators.required],
        phoneNumber: ["", [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      }
    );
    // initialize reactive form field access values for change detection
    // signal forms are not available yet in angular v19
    this.userNameSignal = toSignal( // operator
      this.userForm.controls['username'].valueChanges.pipe(
        debounceTime(300), // operator
        filter(value => value.length > 2), // operator // logicStep
        startWith(this.userForm.controls['username'].value) // operator
      )
    );
    this.emailAddressSignal = toSignal( // operator
      this.userForm.controls['emailAddress'].valueChanges.pipe(
        debounceTime(300), // operator
        filter(value => value.includes('@')), // operator // logicStep
        startWith(this.userForm.controls['emailAddress'].value) // operator
      )
    );

    // reactive field evaluation of user input
    this.isUserNameTaken = computed(() => this.isNameTaken(this.userNameSignal())); // operator // logicStep
    this.isEmailAddressTaken = computed(() => this.isEmailTaken(this.emailAddressSignal())); // operator // logicStep
    this.formFieldStatus = toSignal( // operator
      this.userForm.statusChanges.pipe(
        startWith(this.userForm.status), // operator
        map(status => status ?? '') // operator // logicStep
      )
    );
    // reactive visual user feedback according to state
    this.userNameStatus = computed(() => { // operator
      return this.isUserNameTaken() ? 'Name existiert bereits' : 'ok' // logicStep
    });
    this.emailStatus = computed(() => { ''// operator
      return this.isEmailAddressTaken() ? 'Email existiert bereits' : 'ok' // logicStep
    });
    // search results signal version
    effect(() => { // operator
      this.userSearchResults = this.searchUsers(this.userNameSignal()); // logicStep
    });

    // reactive button state evaluation
    this.canSubmit = computed(() => { // operator
      return this.formFieldStatus() === 'VALID' && !this.isUserNameTaken() && !this.isEmailAddressTaken() // logicStep
    });
  };

  // button event execution
  protected onSubmit() {
    if (this.userForm.valid) { // logicStep
      this.userService.addUser(this.userForm) // logicStep
    } else {
      alert('Bitte alle Felder korrekt ausfüllen.'); // logicStep
    }
  };

  // helper methods for evaluation
  protected isNameTaken(name: string): boolean {
    return this.users()?.some( // logicStep
      user => user.userName.toLowerCase() === name.toLowerCase()
    ) ?? false;
  }
  protected isEmailTaken(address: string) {
    return this.users()?.some( // logicStep
      user => user.eMailAddress.toLowerCase() === address.toLowerCase()
    ) ?? false;
  }
  protected searchUsers(name: string): User[] | undefined {
    return this.users()?.filter( // logicStep
      user => user.userName.toLowerCase() === name.toLowerCase() // logicStep
    );
  }

  // triggers effect when canSubmit is reevaluated - only for evaluation
  protected countCanSubmitEvaluation = effect(() => {
    this.canSubmit();
    this.counter.update(v => v + 1);
    console.log(`canSubmit Signal recomputed ${this.counter()} times`);
  });
}
