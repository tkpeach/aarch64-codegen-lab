define i128 @add_shift_wide(i128 %a, i128 %b) {
entry:
  %shifted = shl i128 %b, 3
  %sum = add i128 %a, %shifted
  ret i128 %sum
}
