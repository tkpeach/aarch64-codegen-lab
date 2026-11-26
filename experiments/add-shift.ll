define i64 @add_shift(i64 %a, i64 %b) {
entry:
  %shifted = shl i64 %b, 3
  %sum = add i64 %a, %shifted
  ret i64 %sum
}
