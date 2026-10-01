# Security

Kazu runs in your page or on your server and reads strings: puzzles, runs and answers. It makes no network requests,
keeps nothing outside the page it is on, and has no dependencies. Its random numbers (mulberry32) are for fair-looking
puzzles and are not secret: never use a seed as a credential.

If you find a way to make it do something it should not, such as a string that makes the check or the solver run
for long, or markup that gets out of the drawing, please write to john@johnmorris.ca rather than in a public issue.
Reports are read and kept confidential, and a fix is released as soon as there is one.
