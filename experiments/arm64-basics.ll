define i64 @mix(i64 %a, i64 %b, i64 %c) {
  %masked = and i64 %b, 255
  %shift = shl i64 %a, 3
  %bits = xor i64 %shift, %masked
  %result = add i64 %bits, %c
  ret i64 %result
}

define i64 @scaled(i64 %a, i64 %b) noinline {
  %p = mul i64 %a, %b
  ret i64 %p
}

define i64 @call_scaled(i64 %a, i64 %b) {
  %r = call i64 @scaled(i64 %a, i64 %b)
  %out = sub i64 %r, 1
  ret i64 %out
}

define i64 @positive_sum(ptr %p, i64 %n) {
entry:
  %empty = icmp eq i64 %n, 0
  br i1 %empty, label %done, label %loop
loop:
  %i = phi i64 [0, %entry], [%next, %loop]
  %acc = phi i64 [0, %entry], [%sum, %loop]
  %addr = getelementptr i32, ptr %p, i64 %i
  %v = load i32, ptr %addr, align 4
  %wide = sext i32 %v to i64
  %pos = icmp sgt i32 %v, 0
  %keep = select i1 %pos, i64 %wide, i64 0
  %sum = add i64 %acc, %keep
  %next = add i64 %i, 1
  %last = icmp eq i64 %next, %n
  br i1 %last, label %done, label %loop
done:
  %r = phi i64 [0, %entry], [%sum, %loop]
  ret i64 %r
}

define void @bump(ptr %p, i64 %i) {
  %addr = getelementptr i32, ptr %p, i64 %i
  %old = load i32, ptr %addr, align 4
  %new = add i32 %old, 1
  store i32 %new, ptr %addr, align 4
  ret void
}

define double @double_add(double %x, double %y) {
  %r = fadd double %x, %y
  ret double %r
}

define <4 x i32> @lanes(<4 x i32> %x, <4 x i32> %y) {
  %r = add <4 x i32> %x, %y
  ret <4 x i32> %r
}
