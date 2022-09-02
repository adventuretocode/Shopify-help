Applies and saves staged changes to an order. Mutations are operating on `OrderEdit`. All order edits start with `orderEditBegin`, have any number of `orderEdit`* mutations made, and end with `orderEditCommit`.

Remove is to set quantity to `0` for orderEditSetQuantity
